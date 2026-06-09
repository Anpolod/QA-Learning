"""Test-documentation practice: list/generate scenarios and AI-review submissions."""

import json

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.providers import get_text_provider
from app.models.entities import AiUsageLog, DocAttempt, DocScenario
from app.services.ai_service import _effective_ai_settings, _effective_secret

# Fields learners are expected to fill, per document type. Used to steer the review.
EXPECTED_FIELDS = {
    "test_case": ["title", "preconditions", "steps", "test_data", "expected_result", "priority"],
    "bug_report": [
        "title",
        "environment",
        "steps_to_reproduce",
        "expected_result",
        "actual_result",
        "severity",
        "priority",
    ],
}


def _validate_type(doc_type: str) -> None:
    if doc_type not in EXPECTED_FIELDS:
        raise HTTPException(status_code=400, detail="doc_type must be 'test_case' or 'bug_report'.")


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1] if "```" in cleaned[3:] else cleaned[3:]
        cleaned = cleaned.removeprefix("json").strip().strip("`").strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start : end + 1]
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="AI returned an unparseable response.") from exc


async def _run_text(db: Session, system_prompt: str, user_prompt: str, *, max_tokens: int) -> str:
    effective = _effective_ai_settings(db)
    provider_name = str(effective["provider"])
    provider = get_text_provider(provider_name)
    key = _effective_secret(db, "openrouterApiKey" if provider_name == "openrouter" else "openaiApiKey")
    if not key:
        raise HTTPException(status_code=503, detail="No AI provider API key configured.")
    return await provider.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        model=str(effective["textModel"]),
        temperature=float(effective["temperature"]),
        max_tokens=max_tokens,
        api_key=key,
    )


def list_scenarios(db: Session, doc_type: str) -> list[DocScenario]:
    _validate_type(doc_type)
    return list(
        db.scalars(
            select(DocScenario).where(DocScenario.doc_type == doc_type).order_by(DocScenario.id)
        ).all()
    )


async def generate_scenario(db: Session, doc_type: str, user_id: int) -> DocScenario:
    _validate_type(doc_type)
    label = "test case" if doc_type == "test_case" else "bug report"
    system = (
        "You design realistic QA practice scenarios for students learning to write test documentation. "
        "Reply with strict JSON only, no prose, no code fences."
    )
    user = (
        f"Create one fresh, realistic scenario a student will use to practise writing a {label}. "
        "Pick a common web/mobile app feature. Keep it concrete but do NOT write the document itself. "
        'Return JSON: {"title": str (<=60 chars), "brief": str (one sentence telling the student what to '
        'write), "context": str (2-3 short sentences of relevant detail: platform, expected behaviour)}.'
    )
    raw = await _run_text(db, system, user, max_tokens=400)
    data = _extract_json(raw)
    scenario = DocScenario(
        doc_type=doc_type,
        title=str(data.get("title", "Practice scenario"))[:200],
        brief=str(data.get("brief", "")),
        context=str(data.get("context", "")),
        source="ai",
    )
    db.add(scenario)
    db.add(AiUsageLog(user_id=user_id, lesson_id=None, mode="generate_doc_scenario", provider=str(_effective_ai_settings(db)["provider"]), model=str(_effective_ai_settings(db)["textModel"]), request_type="text"))
    db.commit()
    db.refresh(scenario)
    return scenario


async def review_submission(
    db: Session, user_id: int, scenario_id: int, doc_type: str, fields: dict[str, str]
) -> tuple[DocAttempt, dict]:
    _validate_type(doc_type)
    scenario = db.get(DocScenario, scenario_id)
    if scenario is None or scenario.doc_type != doc_type:
        raise HTTPException(status_code=404, detail="Scenario not found.")

    expected = EXPECTED_FIELDS[doc_type]
    label = "test case" if doc_type == "test_case" else "bug report"
    # Show EVERY expected field with its value or an explicit (blank) marker so the
    # reviewer never hallucinates a provided field as missing.
    field_lines = "\n".join(f"- {name}: {(fields.get(name) or '').strip() or '(blank)'}" for name in expected)
    if not any((fields.get(name) or "").strip() for name in expected):
        raise HTTPException(status_code=400, detail="Submission is empty.")

    system = (
        f"You are a senior QA reviewer grading a student's {label}. Be strict but fair, constructive and concise. "
        "Reply with strict JSON only, no prose, no code fences."
    )
    user = (
        f"Scenario: {scenario.brief}\nContext: {scenario.context}\n\n"
        f"Student submission (every expected field is shown; '(blank)' means the student left it empty):\n"
        f"{field_lines}\n\n"
        "Grade it. Rules:\n"
        "- Rate a field 'missing' ONLY if its value is '(blank)'. Never mark a filled field 'missing'.\n"
        "- Rate 'good' if the content is clear, specific, and testable; 'weak' only if genuinely vague or "
        "incomplete. Do NOT default to 'weak' — give 'good' freely when a field is clear and adequate.\n"
        "- Reward reproducible steps, observable expected/actual results, and sensible severity/priority.\n"
        "- Read the values carefully before judging; do not invent problems that are not in the text.\n"
        "Scoring anchors: 85-100 = complete, clear, reproducible (all key fields good); 60-84 = solid with minor "
        "gaps; 30-59 = partial or several weak fields; 0-29 = mostly blank or unusable. A correct, clearly written "
        "submission with all fields filled should score 80+.\n\n"
        'Return JSON: {"score": int 0-100, "summary": str (1-2 sentences), '
        '"fields": [{"name": str, "rating": "good"|"weak"|"missing", "comment": str}] (one entry per expected '
        'field, same names as above), "improvements": [str] (2-4 concrete fixes)}.'
    )
    raw = await _run_text(db, system, user, max_tokens=900)
    data = _extract_json(raw)

    try:
        score = max(0, min(100, int(data.get("score", 0))))
    except (TypeError, ValueError):
        score = 0
    feedback = {
        "score": score,
        "summary": str(data.get("summary", "")),
        "fields": [
            {
                "name": str(f.get("name", "")),
                "rating": str(f.get("rating", "weak")),
                "comment": str(f.get("comment", "")),
            }
            for f in data.get("fields", [])
            if isinstance(f, dict)
        ],
        "improvements": [str(i) for i in data.get("improvements", []) if str(i).strip()],
    }

    attempt = DocAttempt(
        user_id=user_id,
        scenario_id=scenario_id,
        doc_type=doc_type,
        submission_json=json.dumps(fields, ensure_ascii=False),
        score=score,
        feedback_json=json.dumps(feedback, ensure_ascii=False),
    )
    db.add(attempt)
    db.add(AiUsageLog(user_id=user_id, lesson_id=None, mode="review_doc", provider=str(_effective_ai_settings(db)["provider"]), model=str(_effective_ai_settings(db)["textModel"]), request_type="text"))
    db.commit()
    db.refresh(attempt)
    return attempt, feedback


def list_attempts(db: Session, user_id: int, limit: int = 30) -> list[dict]:
    rows = db.scalars(
        select(DocAttempt)
        .where(DocAttempt.user_id == user_id)
        .order_by(DocAttempt.created_at.desc())
        .limit(limit)
    ).all()
    out: list[dict] = []
    for r in rows:
        scenario = db.get(DocScenario, r.scenario_id)
        try:
            summary = json.loads(r.feedback_json).get("summary", "")
        except json.JSONDecodeError:
            summary = ""
        out.append(
            {
                "id": r.id,
                "scenario_id": r.scenario_id,
                "scenario_title": scenario.title if scenario else "(removed)",
                "doc_type": r.doc_type,
                "score": r.score,
                "summary": summary,
                "created_at": r.created_at,
            }
        )
    return out
