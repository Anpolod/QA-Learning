from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module
from app.seed.import_slide_assets import DECK_LESSON_MAP


LEGACY_MODULE_TITLES = {
    "Manual QA Foundations",
    "QA Automation Foundations",
    "AI for QA Foundations",
}

LESSON_TO_DECK_SLUG = {
    lesson_title: deck_slug
    for deck_slug, lesson_titles in DECK_LESSON_MAP.items()
    for lesson_title in lesson_titles
}


def report_missing_slide_images() -> None:
    db = SessionLocal()
    try:
        stmt = (
            select(Course)
            .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.slides))
            .order_by(Course.id)
        )
        total_lessons = 0
        missing: list[tuple[str, str, str, str]] = []
        for course in db.scalars(stmt).all():
            modules = sorted(course.modules, key=lambda module: module.order_index)
            for module in modules:
                if module.title in LEGACY_MODULE_TITLES:
                    continue
                lessons = sorted(module.lessons, key=lambda lesson: lesson.order_index)
                for lesson in lessons:
                    total_lessons += 1
                    has_image = any(slide.image_url.strip() for slide in lesson.slides)
                    if not has_image:
                        missing.append(
                            (
                                course.title,
                                module.title,
                                lesson.title,
                                LESSON_TO_DECK_SLUG.get(lesson.title, "missing-slug"),
                            )
                        )

        print(f"total_current_lessons={total_lessons}")
        print(f"missing_slide_image_lessons={len(missing)}")
        for course_title, module_title, lesson_title, deck_slug in missing:
            print(f"{course_title} | {module_title} | {lesson_title} | {deck_slug}")
    finally:
        db.close()


if __name__ == "__main__":
    report_missing_slide_images()
