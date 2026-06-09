"""Upsert seed test-documentation scenarios from doc_scenarios.json.

Idempotent: matches by (doc_type, title). Run inside the backend container:
    python -m app.seed.apply_doc_scenarios
"""

import json
from pathlib import Path

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import DocScenario

DATA = Path(__file__).parent / "doc_scenarios.json"


def apply_doc_scenarios() -> None:
    if not DATA.exists():
        raise SystemExit(f"Scenario file not found: {DATA}")
    data = json.loads(DATA.read_text(encoding="utf-8"))
    db = SessionLocal()
    applied = 0
    try:
        for item in data:
            row = db.scalar(
                select(DocScenario).where(
                    DocScenario.doc_type == item["doc_type"], DocScenario.title == item["title"]
                )
            )
            if row:
                row.brief = item["brief"]
                row.context = item.get("context", "")
            else:
                db.add(
                    DocScenario(
                        doc_type=item["doc_type"],
                        title=item["title"],
                        brief=item["brief"],
                        context=item.get("context", ""),
                        source="seed",
                    )
                )
            applied += 1
        db.commit()
        print(f"doc_scenarios={applied}")
    finally:
        db.close()


if __name__ == "__main__":
    apply_doc_scenarios()
