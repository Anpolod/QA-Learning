from datetime import datetime

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.entities import UserProgress


def upsert_lesson_progress(
    db: Session,
    *,
    user_id: int,
    lesson_id: int,
    opened: bool | None = None,
    completed: bool | None = None,
    quiz_completed: bool | None = None,
    homework_submitted: bool | None = None,
) -> None:
    values = {
        "user_id": user_id,
        "lesson_id": lesson_id,
        "opened": opened if opened is not None else True,
        "completed": completed if completed is not None else False,
        "quiz_completed": quiz_completed if quiz_completed is not None else False,
        "homework_submitted": homework_submitted if homework_submitted is not None else False,
        "updated_at": datetime.utcnow(),
    }
    updates = {"updated_at": datetime.utcnow()}
    for key, value in {
        "opened": opened,
        "completed": completed,
        "quiz_completed": quiz_completed,
        "homework_submitted": homework_submitted,
    }.items():
        if value is not None:
            updates[key] = value

    statement = (
        insert(UserProgress)
        .values(**values)
        .on_conflict_do_update(index_elements=["user_id", "lesson_id"], set_=updates)
    )
    db.execute(statement)

