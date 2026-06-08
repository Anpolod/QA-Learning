from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import SessionLocal
from app.models.entities import Lesson, LessonSlide


LEGACY_SLIDE_FIXES = {
    "SDLC and STLC": {
        "image_url": "/uploads/course-slides/sdlc-and-stlc/Slide_01.png",
        "title": "SDLC and STLC overview",
        "body": (
            "Compare the Software Development Life Cycle with the Software Testing Life Cycle "
            "and identify where QA activities support delivery."
        ),
    },
    "Admin CRUD Smoke Lesson Updated": {
        "image_url": "/uploads/course-slides/admin-crud-smoke-lesson-updated/Slide_01.png",
        "title": "Admin CRUD smoke test flow",
        "body": (
            "Verify the core admin Create, Read, Update, and Delete path with a compact smoke test."
        ),
    },
}


def fix_legacy_slide_images() -> None:
    db = SessionLocal()
    updated = 0
    created = 0
    try:
        for lesson_title, fix in LEGACY_SLIDE_FIXES.items():
            lesson = db.scalar(
                select(Lesson)
                .options(selectinload(Lesson.slides))
                .where(Lesson.title == lesson_title)
                .order_by(Lesson.id)
            )
            if lesson is None:
                print(f"missing_lesson={lesson_title}")
                continue

            slides = sorted(lesson.slides, key=lambda slide: slide.order_index)
            if slides:
                slide = slides[0]
                slide.image_url = fix["image_url"]
                if not slide.title.strip():
                    slide.title = fix["title"]
                if not slide.body.strip():
                    slide.body = fix["body"]
                updated += 1
            else:
                db.add(
                    LessonSlide(
                        lesson_id=lesson.id,
                        title=fix["title"],
                        body=fix["body"],
                        order_index=1,
                        image_url=fix["image_url"],
                    )
                )
                created += 1

        db.commit()
        print(f"updated_legacy_slides={updated}")
        print(f"created_legacy_slides={created}")
    finally:
        db.close()


if __name__ == "__main__":
    fix_legacy_slide_images()
