"""Idempotently create curriculum lessons that were missing from the original seed.

Creates the lesson row only (empty text fields); run apply_lesson_content afterwards
to fill theory/example/task/homework/quiz from backend/app/seed/content/*.json.

Run inside the backend container:
    python -m app.seed.add_missing_lessons
    python -m app.seed.apply_lesson_content
"""

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module

# (course section, module title, lesson title, insert-at order_index)
MISSING_LESSONS = [
    ("manual", "QA Foundations", "Principles of testing", 3),
]

EMPTY_TEXT_FIELDS = {
    "short_description": "",
    "learning_goals": "",
    "theory": "",
    "key_terms": "",
    "real_world_example": "",
    "step_by_step": "",
    "common_mistakes": "",
    "practical_use_case": "",
    "summary": "",
}


def add_missing_lessons() -> None:
    db = SessionLocal()
    created = 0
    try:
        for section, module_title, lesson_title, at_order in MISSING_LESSONS:
            if db.scalar(select(Lesson).where(Lesson.title == lesson_title)):
                print(f"exists, skip: {lesson_title}")
                continue

            module = db.scalar(
                select(Module)
                .join(Course, Course.id == Module.course_id)
                .where(Course.section == section, Module.title == module_title)
            )
            if not module:
                print(f"module not found: {section} / {module_title}")
                continue

            # Make room: shift later lessons in this module down by one.
            for lesson in db.scalars(
                select(Lesson).where(Lesson.module_id == module.id, Lesson.order_index >= at_order)
            ).all():
                lesson.order_index += 1

            db.add(Lesson(module_id=module.id, title=lesson_title, order_index=at_order, **EMPTY_TEXT_FIELDS))
            created += 1
            print(f"created: {lesson_title} in {module_title} at order {at_order}")
        db.commit()
        print(f"created_lessons={created}")
    finally:
        db.close()


if __name__ == "__main__":
    add_missing_lessons()
