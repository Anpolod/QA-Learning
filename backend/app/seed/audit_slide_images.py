from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module


UPLOADS_ROOT = Path("/app/uploads")


def audit_slide_images() -> None:
    db = SessionLocal()
    try:
        stmt = (
            select(Course)
            .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.slides))
            .order_by(Course.id)
        )

        total_lessons = 0
        lessons_without_slide_rows: list[tuple[str, str, int, str]] = []
        lessons_without_any_image: list[tuple[str, str, int, str, int]] = []
        broken_image_urls: list[tuple[str, str, int, str, int, str, str]] = []

        for course in db.scalars(stmt).all():
            modules = sorted(course.modules, key=lambda module: module.order_index)
            for module in modules:
                lessons = sorted(module.lessons, key=lambda lesson: lesson.order_index)
                for lesson in lessons:
                    total_lessons += 1
                    slides = sorted(lesson.slides, key=lambda slide: slide.order_index)
                    image_slides = [slide for slide in slides if slide.image_url.strip()]

                    if not slides:
                        lessons_without_slide_rows.append((course.title, module.title, lesson.id, lesson.title))

                    if not image_slides:
                        lessons_without_any_image.append(
                            (course.title, module.title, lesson.id, lesson.title, len(slides))
                        )

                    for slide in image_slides:
                        url = slide.image_url.strip()
                        if not url.startswith("/uploads/"):
                            broken_image_urls.append(
                                (course.title, module.title, lesson.id, lesson.title, slide.id, url, "non-local-url")
                            )
                            continue

                        local_path = UPLOADS_ROOT / url.removeprefix("/uploads/")
                        if not local_path.exists():
                            broken_image_urls.append(
                                (
                                    course.title,
                                    module.title,
                                    lesson.id,
                                    lesson.title,
                                    slide.id,
                                    url,
                                    str(local_path),
                                )
                            )

        print(f"total_lessons_all_modules={total_lessons}")
        print(f"lessons_without_slide_rows={len(lessons_without_slide_rows)}")
        for row in lessons_without_slide_rows:
            print("NO_SLIDES | " + " | ".join(map(str, row)))

        print(f"lessons_without_any_image={len(lessons_without_any_image)}")
        for row in lessons_without_any_image:
            print("NO_IMAGE | " + " | ".join(map(str, row)))

        print(f"image_urls_with_missing_files={len(broken_image_urls)}")
        for row in broken_image_urls:
            print("BROKEN_FILE | " + " | ".join(map(str, row)))
    finally:
        db.close()


if __name__ == "__main__":
    audit_slide_images()
