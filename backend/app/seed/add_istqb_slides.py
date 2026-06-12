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


def _text(value: object) -> str:
    if isinstance(value, list):
        value = "\n".join(str(item) for item in value)
    elif value is None:
        value = ""
    else:
        value = str(value)
    return value.replace("\\n", "\n")


def _slides_for(lesson: Lesson) -> list[tuple[str, str]]:
    slides: list[tuple[str, str]] = []
    learning_goals = _text(lesson.learning_goals)
    short_description = _text(lesson.short_description)
    if learning_goals or short_description:
        slides.append(("Overview", learning_goals or short_description))

    paragraphs = [p.strip() for p in _text(lesson.theory).split("\n\n") if p.strip()]
    paragraphs = paragraphs[:MAX_THEORY_SLIDES]
    for i, para in enumerate(paragraphs, start=1):
        title = "Core concept" if len(paragraphs) == 1 else f"Core concept ({i})"
        slides.append((title, para))

    key_terms = _text(lesson.key_terms)
    real_world_example = _text(lesson.real_world_example)
    common_mistakes = _text(lesson.common_mistakes)
    summary = _text(lesson.summary)
    if key_terms:
        slides.append(("Key terms", key_terms))
    if real_world_example:
        slides.append(("Real-world example", real_world_example))
    if common_mistakes:
        slides.append(("Common mistakes", common_mistakes))
    if summary:
        slides.append(("Summary", summary))
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
