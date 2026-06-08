from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, LessonSlide, Module


MIN_SLIDES_PER_LESSON = 5

SUPPLEMENTAL_SLIDES = [
    (
        "Purpose",
        "Define the goal of this topic and explain why it matters in a practical QA workflow.",
    ),
    (
        "Core Workflow",
        "Break the topic into a clear sequence of actions a QA specialist can follow during real work.",
    ),
    (
        "Practical Example",
        "Show how the concept appears in a realistic project situation and what evidence QA should collect.",
    ),
    (
        "Common Risks",
        "Highlight mistakes, weak assumptions, and review points that can reduce the quality of testing.",
    ),
    (
        "Review Checklist",
        "Summarize the checks a learner should complete before considering the work finished.",
    ),
]


def fill_slide_image_urls() -> None:
    db = SessionLocal()
    created = 0
    filled = 0
    skipped_without_image = 0

    try:
        stmt = (
            select(Course)
            .options(selectinload(Course.modules).selectinload(Module.lessons).selectinload(Lesson.slides))
            .order_by(Course.id)
        )

        for course in db.scalars(stmt).all():
            for module in sorted(course.modules, key=lambda item: item.order_index):
                for lesson in sorted(module.lessons, key=lambda item: item.order_index):
                    slides = sorted(lesson.slides, key=lambda item: item.order_index)
                    source_image_url = next((slide.image_url.strip() for slide in slides if slide.image_url.strip()), "")

                    if not source_image_url:
                        skipped_without_image += 1
                        continue

                    while len(slides) < MIN_SLIDES_PER_LESSON:
                        template = SUPPLEMENTAL_SLIDES[len(slides) % len(SUPPLEMENTAL_SLIDES)]
                        slide = LessonSlide(
                            lesson_id=lesson.id,
                            title=f"{lesson.title}: {template[0]}",
                            body=template[1],
                            order_index=len(slides) + 1,
                            image_url=source_image_url,
                        )
                        db.add(slide)
                        slides.append(slide)
                        created += 1

                    for slide in slides:
                        if not slide.image_url.strip():
                            slide.image_url = source_image_url
                            filled += 1

        db.commit()
        print(f"created_slides={created}")
        print(f"filled_slide_image_urls={filled}")
        print(f"skipped_lessons_without_source_image={skipped_without_image}")
    finally:
        db.close()


if __name__ == "__main__":
    fill_slide_image_urls()
