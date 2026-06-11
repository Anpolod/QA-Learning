"""Build richer text slides for ISTQB lessons (no images) from their content.

Rebuilds slides per lesson (~6-9: Overview, theory concept slides, Key terms,
Real-world example, Common mistakes, Summary). Scoped to the ISTQB course.

Safety: lessons whose existing slides carry images (image_url set — i.e. admin
curation) are SKIPPED unless --force is passed, so a routine re-run cannot
destroy curated content.

    python -m app.seed.add_istqb_slides [--force]
"""

import sys

from sqlalchemy import delete, select

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, LessonSlide, Module

SECTION = "istqb"
MAX_THEORY_SLIDES = 4


def _slides_for(lesson: Lesson) -> list[tuple[str, str]]:
    slides: list[tuple[str, str]] = []
    if lesson.learning_goals or lesson.short_description:
        slides.append(("Overview", lesson.learning_goals or lesson.short_description))

    paragraphs = [p.strip() for p in (lesson.theory or "").split("\n\n") if p.strip()]
    paragraphs = paragraphs[:MAX_THEORY_SLIDES]
    for i, para in enumerate(paragraphs, start=1):
        title = "Core concept" if len(paragraphs) == 1 else f"Core concept ({i})"
        slides.append((title, para))

    if lesson.key_terms:
        slides.append(("Key terms", lesson.key_terms))
    if lesson.real_world_example:
        slides.append(("Real-world example", lesson.real_world_example))
    if lesson.common_mistakes:
        slides.append(("Common mistakes", lesson.common_mistakes))
    if lesson.summary:
        slides.append(("Summary", lesson.summary))
    return slides


def add_istqb_slides(force: bool = False) -> None:
    db = SessionLocal()
    created = 0
    skipped = 0
    try:
        lessons = db.scalars(
            select(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .join(Course, Course.id == Module.course_id)
            .where(Course.section == SECTION)
        ).all()
        for lesson in lessons:
            has_image_slides = db.scalar(
                select(LessonSlide.id).where(LessonSlide.lesson_id == lesson.id, LessonSlide.image_url != "").limit(1)
            )
            if has_image_slides and not force:
                skipped += 1
                continue
            db.execute(delete(LessonSlide).where(LessonSlide.lesson_id == lesson.id))
            for index, (title, body) in enumerate(_slides_for(lesson), start=1):
                db.add(LessonSlide(lesson_id=lesson.id, title=title, body=body, order_index=index, image_url=""))
                created += 1
        db.commit()
        print(f"created_slides={created} skipped_curated_lessons={skipped}")
    finally:
        db.close()


if __name__ == "__main__":
    add_istqb_slides(force="--force" in sys.argv)
