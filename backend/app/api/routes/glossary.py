from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.entities import GlossaryTerm

router = APIRouter()


@router.get("")
def list_glossary(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(GlossaryTerm).order_by(GlossaryTerm.term)).all()
    return [
        {"slug": r.slug, "term": r.term, "definition": r.definition, "category": r.category}
        for r in rows
    ]
