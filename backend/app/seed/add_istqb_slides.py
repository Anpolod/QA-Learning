"""Create text slides for ISTQB lessons (no images) from their existing content,
so the lesson Slides section is not empty. Idempotent: skips lessons that
already have slides. Scoped to the ISTQB course only.

    python -m app.seed.add_istqb_slides
"""

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, LessonSlide, Module

SECTION = "istqb"


def _slides_for(lesson: Lesson) -> list[tuple[str, str]]:
    parts = [
        ("Overview", lesson.learning_goals or lesson.short_description),
        ("Key terms", lesson.key_terms),
        ("Real-world example", lesson.real_world_example),
        ("Summary", lesson.summary),
    ]
    return [(title, body) for title, body in parts if body]


def add_istqb_slides() -> None:
    db = SessionLocal()
    created = 0
    try:
        lessons = db.scalars(
            select(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .join(Course, Course.id == Module.course_id)
            .where(Course.section == SECTION)
        ).all()
        for lesson in lessons:
            if db.scalar(select(LessonSlide).where(LessonSlide.lesson_id == lesson.id)):
                continue
            for index, (title, body) in enumerate(_slides_for(lesson), start=1):
                db.add(LessonSlide(lesson_id=lesson.id, title=title, body=body, order_index=index, image_url=""))
                created += 1
        db.commit()
        print(f"created_slides={created}")
    finally:
        db.close()


if __name__ == "__main__":
    add_istqb_slides()
