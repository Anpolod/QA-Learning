from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module


def audit_slide_counts() -> None:
    db = SessionLocal()
    try:
        stmt = (
            select(Course)
            .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.slides))
            .order_by(Course.id)
        )
        counts: Counter[int] = Counter()
        sparse: list[tuple[str, str, int, str, int, int]] = []

        for course in db.scalars(stmt).all():
            for module in sorted(course.modules, key=lambda item: item.order_index):
                for lesson in sorted(module.lessons, key=lambda item: item.order_index):
                    slide_count = len(lesson.slides)
                    image_count = sum(1 for slide in lesson.slides if slide.image_url.strip())
                    counts[slide_count] += 1
                    if slide_count < 5:
                        sparse.append((course.title, module.title, lesson.id, lesson.title, slide_count, image_count))

        total = sum(counts.values())
        print(f"total_lessons={total}")
        print("slide_count_distribution=" + ", ".join(f"{count}:{counts[count]}" for count in sorted(counts)))
        print(f"lessons_with_less_than_5_slides={len(sparse)}")
        for row in sparse:
            print("SPARSE | " + " | ".join(map(str, row)))
    finally:
        db.close()


if __name__ == "__main__":
    audit_slide_counts()
