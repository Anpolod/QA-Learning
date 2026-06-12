"""Upsert glossary terms from backend/app/seed/glossary.json into the database.

Idempotent: matches by slug (derived from the term). Run inside the backend container:
    python -m app.seed.apply_glossary
"""

import json
import re
from pathlib import Path

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import GlossaryTerm

DATA = Path(__file__).parent / "glossary.json"


def slugify(term: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
    return slug or "term"


def apply_glossary() -> None:
    if not DATA.exists():
        raise SystemExit(f"Glossary file not found: {DATA}")
    data = json.loads(DATA.read_text(encoding="utf-8"))
    db = SessionLocal()
    applied = 0
    try:
        for item in data:
            term = item["term"].strip()
            slug = slugify(term)
            row = db.scalar(select(GlossaryTerm).where(GlossaryTerm.slug == slug))
            if row:
                row.term = term
                row.definition = item["definition"]
                row.category = item.get("category", "")
            else:
                db.add(
                    GlossaryTerm(
                        slug=slug,
                        term=term,
                        definition=item["definition"],
                        category=item.get("category", ""),
                    )
                )
            applied += 1
        db.commit()
        print(f"glossary_terms={applied}")
    finally:
        db.close()


if __name__ == "__main__":
    apply_glossary()
