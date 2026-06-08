from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module


def audit_slide_image_counts() -> None:
    db = SessionLocal()
    try:
        stmt = (
            select(Course)
            .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.slides))
            .order_by(Course.id)
        )
        distribution: Counter[tuple[int, int]] = Counter()
        partial: list[tuple[str, str, int, str, int, int]] = []

        for course in db.scalars(stmt).all():
            for module in sorted(course.modules, key=lambda item: item.order_index):
                for lesson in sorted(module.lessons, key=lambda item: item.order_index):
                    slide_count = len(lesson.slides)
                    image_count = sum(1 for slide in lesson.slides if slide.image_url.strip())
                    distribution[(slide_count, image_count)] += 1
                    if slide_count and image_count < slide_count:
                        partial.append((course.title, module.title, lesson.id, lesson.title, slide_count, image_count))

        print("slide_image_distribution=" + ", ".join(
            f"{slide_count}slides_{image_count}images:{count}"
            for (slide_count, image_count), count in sorted(distribution.items())
        ))
        print(f"lessons_with_some_slides_missing_images={len(partial)}")
        for row in partial:
            print("PARTIAL_IMAGE | " + " | ".join(map(str, row)))
    finally:
        db.close()


if __name__ == "__main__":
    audit_slide_image_counts()
