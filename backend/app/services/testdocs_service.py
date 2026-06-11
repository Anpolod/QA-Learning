"""Test-documentation practice: list/generate scenarios and AI-review submissions."""

import json

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.providers import get_text_provider
from app.models.entities import AiUsageLog, DocAttempt, DocScenario
from app.services.ai_service import _daily_count, _effective_ai_settings, _effective_secret


def _enforce_daily_limit(db: Session, user_id: int, effective: dict) -> None:
    if _daily_count(db, user_id, "text") >= int(effective["dailyTextLimitPerUser"]):
        raise HTTPException(status_code=429, detail="Daily AI request limit reached. Try again tomorrow.")

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
    "decision_table": ["title", "conditions", "rules", "actions"],
    "test_plan": ["title", "scope", "approach", "entry_criteria", "exit_criteria", "risks", "schedule"],
    "bdd": ["title", "feature", "scenarios"],
    "test_summary": ["title", "summary", "metrics", "open_defects", "risks", "recommendation"],
    "traceability": ["title", "requirements", "matrix", "coverage_notes"],
    "checklist": ["title", "area", "items"],
}

LABELS = {
    "test_case": "test case",
    "bug_report": "bug report",
    "decision_table": "decision table",
    "test_plan": "test plan",
    "bdd": "set of Given/When/Then acceptance scenarios",
    "test_summary": "test summary report",
    "traceability": "requirements traceability matrix",
    "checklist": "test checklist",
}

# Extra, type-specific grading guidance appended to the review prompt.
TYPE_GUIDANCE = {
    "decision_table": (
        "- Conditions must be clear and boolean/discrete (each evaluates to Yes/No or a small set).\n"
        "- Rules must cover the relevant condition combinations: for n independent boolean conditions a "
        "complete table has 2^n rules (fewer only if some combinations are impossible or collapsed with '-').\n"
        "- Every rule must map to exactly one action/outcome; flag missing actions.\n"
        "- Penalise contradictory or duplicate rules and any uncovered combination.\n"
        "- IMPORTANT: if ALL combinations are covered and EVERY rule has a clear action, the 'rules' and "
        "'actions' fields are GOOD (not weak) and the table should score 85+. Terse but correct notation such "
        "as 'R1: A=Y, B=N -> 15% discount' is perfectly acceptable — do not mark it weak for brevity.\n"
    ),
    "test_plan": (
        "- Scope must state both what IS and what is NOT tested (in/out).\n"
        "- Entry and exit criteria must be specific and measurable (e.g. 'all P1 tests pass, <5 open majors'), "
        "not vague ('testing is done').\n"
        "- Risks must be real and paired with a mitigation; the schedule/resources should be plausible.\n"
        "- A clear, complete plan with measurable criteria should score 85+.\n"
    ),
    "bdd": (
        "- Each scenario must follow Given / When / Then (Given = context, When = action, Then = observable "
        "outcome).\n"
        "- Scenarios should be atomic (one behaviour each), declarative (business language, not UI clicks), and "
        "cover both the happy path and at least one edge/negative case.\n"
        "- Penalise missing Then assertions, multiple unrelated behaviours in one scenario, and imperative "
        "step-by-step UI wording.\n"
        "- Well-formed scenarios covering happy + edge cases should score 85+.\n"
    ),
    "test_summary": (
        "- Must include result metrics (tests planned/executed/passed/failed, pass rate).\n"
        "- Must list open defects (ideally by severity) and the residual risk.\n"
        "- Must end with a clear, justified release recommendation (go / no-go / conditional).\n"
        "- A report with metrics, open defects, residual risk and a justified recommendation should score 85+.\n"
    ),
    "traceability": (
        "- Every requirement must map to at least one test; flag any requirement with no test (a coverage gap).\n"
        "- Each mapping should carry a status (e.g. Covered / Partial / Not covered or Pass / Fail).\n"
        "- Reward full requirement coverage and clear status; penalise orphan tests and uncovered requirements.\n"
        "- A matrix where every requirement is traced to a test with a status should score 85+.\n"
    ),
    "checklist": (
        "- Each item must be a concrete, verifiable check that can be answered yes/no (e.g. 'Empty email shows "
        "a validation error'), not a vague topic ('check validation').\n"
        "- Items should be atomic (one check each), non-duplicated, and cover the key cases of the area "
        "(happy path, boundaries, negative/error cases).\n"
        "- Penalise vague/untestable items, duplicates, and big gaps in coverage of the stated area.\n"
        "- A focused list of clear, verifiable, well-covering checks should score 85+.\n"
    ),
}


# Extra instruction appended when AI-generating a scenario, so it fits the document type.
SCENARIO_EXTRA = {
    "decision_table": " The scenario should describe business rules with a few boolean conditions that drive "
    "different outcomes (so the student can model a decision table).",
    "test_plan": " The scenario should describe a feature or release to plan testing for (give scope hints, "
    "rough risk areas).",
    "bdd": " The scenario should describe a feature whose behaviour the student will capture as Given/When/Then "
    "acceptance scenarios.",
    "test_summary": " The scenario should describe a completed test cycle with some made-up results (counts, a "
    "few open defects) so the student can write the summary and a release recommendation.",
    "traceability": " The scenario should list a few requirements/user stories the student will trace to tests "
    "in a matrix.",
    "checklist": " The scenario should name a feature/area for which the student will write a test checklist "
    "(give a few hints about what matters in that area).",
}


def _validate_type(doc_type: str) -> None:
    if doc_type not in EXPECTED_FIELDS:
        raise HTTPException(status_code=400, detail=f"Unknown doc_type. Allowed: {', '.join(EXPECTED_FIELDS)}.")


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


async def _run_text(db: Session, effective: dict, system_prompt: str, user_prompt: str, *, max_tokens: int) -> str:
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
    effective = _effective_ai_settings(db)
    _enforce_daily_limit(db, user_id, effective)
    label = LABELS[doc_type]
    extra = SCENARIO_EXTRA.get(doc_type, "")
    system = (
        "You design realistic QA practice scenarios for students learning to write test documentation. "
        "Reply with strict JSON only, no prose, no code fences."
    )
    user = (
        f"Create one fresh, realistic scenario a student will use to practise writing a {label}.{extra} "
        "Pick a common web/mobile app feature. Keep it concrete but do NOT write the document itself. "
        'Return JSON: {"title": str (<=60 chars), "brief": str (one sentence telling the student what to '
        'write), "context": str (2-3 short sentences of relevant detail: platform, rules, expected behaviour)}.'
    )
    raw = await _run_text(db, effective, system, user, max_tokens=400)
    data = _extract_json(raw)
    scenario = DocScenario(
        doc_type=doc_type,
        title=str(data.get("title", "Practice scenario"))[:200],
        brief=str(data.get("brief", "")),
        context=str(data.get("context", "")),
        source="ai",
    )
    db.add(scenario)
    db.add(
        AiUsageLog(
            user_id=user_id,
            lesson_id=None,
            mode="generate_doc_scenario",
            provider=str(effective["provider"]),
            model=str(effective["textModel"]),
            request_type="text",
        )
    )
    db.commit()
    db.refresh(scenario)
    return scenario


async def review_submission(
    db: Session, user_id: int, scenario_id: int, doc_type: str, fields: dict[str, str]
) -> tuple[DocAttempt, dict]:
    _validate_type(doc_type)
    effective = _effective_ai_settings(db)
    _enforce_daily_limit(db, user_id, effective)
    scenario = db.get(DocScenario, scenario_id)
    if scenario is None or scenario.doc_type != doc_type:
        raise HTTPException(status_code=404, detail="Scenario not found.")

    expected = EXPECTED_FIELDS[doc_type]
    label = LABELS[doc_type]
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
        f"{TYPE_GUIDANCE.get(doc_type, '')}"
        "Scoring anchors: 85-100 = complete, clear, reproducible (all key fields good); 60-84 = solid with minor "
        "gaps; 30-59 = partial or several weak fields; 0-29 = mostly blank or unusable. A correct, clearly written "
        "submission with all fields filled should score 80+.\n\n"
        'Return JSON: {"score": int 0-100, "summary": str (1-2 sentences), '
        '"fields": [{"name": str, "rating": "good"|"weak"|"missing", "comment": str}] (one entry per expected '
        'field, same names as above), "improvements": [str] (2-4 concrete fixes)}.'
    )
    raw = await _run_text(db, effective, system, user, max_tokens=900)
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
    db.add(
        AiUsageLog(
            user_id=user_id,
            lesson_id=None,
            mode="review_doc",
            provider=str(effective["provider"]),
            model=str(effective["textModel"]),
            request_type="text",
        )
    )
    db.commit()
    db.refresh(attempt)
    return attempt, feedback


def list_attempts(db: Session, user_id: int, limit: int = 30) -> list[dict]:
    rows = db.execute(
        select(DocAttempt, DocScenario.title)
        .outerjoin(DocScenario, DocScenario.id == DocAttempt.scenario_id)
        .where(DocAttempt.user_id == user_id)
        .order_by(DocAttempt.created_at.desc())
        .limit(limit)
    ).all()
    out: list[dict] = []
    for r, scenario_title in rows:
        try:
            summary = json.loads(r.feedback_json).get("summary", "")
        except json.JSONDecodeError:
            summary = ""
        out.append(
            {
                "id": r.id,
                "scenario_id": r.scenario_id,
                "scenario_title": scenario_title or "(removed)",
                "doc_type": r.doc_type,
                "score": r.score,
                "summary": summary,
                "created_at": r.created_at,
            }
        )
    return out
