import json
from pathlib import Path

from app.database.session import SessionLocal
from app.models.entities import LessonSlide


UPDATES_PATH = Path("/app/uploads/course-slides/generated_slide_updates.json")


def apply_generated_slide_updates() -> None:
    updates = json.loads(UPDATES_PATH.read_text(encoding="utf-8"))
    db = SessionLocal()
    updated = 0
    missing = 0
    try:
        for item in updates:
            slide = db.get(LessonSlide, item["slide_id"])
            if slide is None:
                missing += 1
                continue
            slide.image_url = item["image_url"]
            updated += 1
        db.commit()
        print(f"updated_slide_image_urls={updated}")
        print(f"missing_slides={missing}")
    finally:
        db.close()


if __name__ == "__main__":
    apply_generated_slide_updates()
