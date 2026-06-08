from __future__ import annotations

import json
import textwrap
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


API_URL = "http://localhost:8000/api/courses"
OUTPUT_ROOT = Path("backend/uploads/course-slides")
UPDATES_PATH = OUTPUT_ROOT / "generated_slide_updates.json"
WIDTH = 1600
HEIGHT = 900


PALETTES = [
    {"accent": (0, 121, 128), "accent_2": (18, 94, 170), "soft": (229, 247, 248)},
    {"accent": (20, 112, 188), "accent_2": (224, 139, 30), "soft": (232, 242, 252)},
    {"accent": (110, 80, 170), "accent_2": (0, 135, 118), "soft": (242, 236, 250)},
    {"accent": (216, 106, 59), "accent_2": (39, 108, 143), "soft": (253, 239, 232)},
    {"accent": (39, 132, 96), "accent_2": (52, 90, 160), "soft": (235, 248, 241)},
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT_TITLE = load_font(58, bold=True)
FONT_SUBTITLE = load_font(30, bold=True)
FONT_BODY = load_font(31)
FONT_SMALL = load_font(23)
FONT_META = load_font(20, bold=True)


def fetch_courses() -> list[dict]:
    with urllib.request.urlopen(API_URL, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def wrap_text(text: str, width: int) -> list[str]:
    normalized = " ".join((text or "").split())
    if not normalized:
        return []
    lines: list[str] = []
    for paragraph in normalized.split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=width, break_long_words=False))
    return lines


def draw_wrapped(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font: ImageFont.ImageFont, fill: tuple[int, int, int], width: int, line_height: int, max_lines: int | None = None) -> int:
    x, y = xy
    lines = wrap_text(text, width)
    if max_lines is not None and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".") + "..."
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height
    return y


def slug_from_image_url(image_url: str, fallback: str) -> str:
    parts = [part for part in image_url.split("/") if part]
    if len(parts) >= 3 and parts[-1].lower().endswith(".png"):
        return parts[-2]
    return fallback


def draw_slide_card(
    output_path: Path,
    course_title: str,
    module_title: str,
    lesson_title: str,
    slide: dict,
    slide_count: int,
) -> None:
    palette = PALETTES[(slide["order_index"] - 1) % len(PALETTES)]
    accent = palette["accent"]
    accent_2 = palette["accent_2"]
    soft = palette["soft"]

    image = Image.new("RGB", (WIDTH, HEIGHT), (248, 250, 252))
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle((0, 0, WIDTH, HEIGHT), radius=0, fill=(248, 250, 252))
    draw.rectangle((0, 0, WIDTH, 96), fill=accent)
    draw.rounded_rectangle((60, 28, 430, 68), radius=18, fill=(255, 255, 255))
    draw.text((86, 37), "INTERACTIVE QA LEARNING", font=FONT_META, fill=accent)
    draw.text((WIDTH - 250, 34), f"SLIDE {slide['order_index']} / {slide_count}", font=FONT_META, fill=(255, 255, 255))

    draw.rounded_rectangle((58, 138, 1500, 792), radius=28, fill=(255, 255, 255), outline=(218, 226, 236), width=2)
    draw.rectangle((58, 138, 74, 792), fill=accent_2)

    draw.text((110, 165), course_title.upper(), font=FONT_SMALL, fill=accent)
    draw.text((110, 202), module_title, font=FONT_SMALL, fill=(71, 85, 105))

    title = slide.get("title") or lesson_title
    draw_wrapped(draw, (110, 270), title, FONT_TITLE, (15, 23, 42), width=31, line_height=66, max_lines=2)

    body = slide.get("body") or lesson_title
    body_y = draw_wrapped(draw, (110, 435), body, FONT_BODY, (51, 65, 85), width=64, line_height=44, max_lines=6)

    chip_y = max(body_y + 36, 690)
    chips = ["Key idea", "Practice", "Review"]
    chip_x = 110
    for chip in chips:
        bbox = draw.textbbox((0, 0), chip, font=FONT_SMALL)
        chip_w = bbox[2] - bbox[0] + 46
        draw.rounded_rectangle((chip_x, chip_y, chip_x + chip_w, chip_y + 44), radius=16, fill=soft, outline=accent)
        draw.text((chip_x + 23, chip_y + 10), chip, font=FONT_SMALL, fill=accent)
        chip_x += chip_w + 18

    panel = (1045, 210, 1426, 690)
    draw.rounded_rectangle(panel, radius=24, fill=soft, outline=(203, 213, 225), width=2)
    draw.ellipse((1110, 275, 1370, 535), fill=(255, 255, 255), outline=accent, width=8)
    draw.arc((1140, 305, 1340, 505), start=25, end=335, fill=accent_2, width=12)
    draw.line((1170, 535, 1118, 620), fill=accent, width=10)
    draw.line((1330, 535, 1382, 620), fill=accent, width=10)
    draw.rounded_rectangle((1162, 608, 1340, 642), radius=12, fill=accent)
    draw.text((1128, 368), "QA", font=load_font(78, bold=True), fill=accent)
    draw.text((1110, 664), "Visual summary", font=FONT_SMALL, fill=(71, 85, 105))

    footer = f"{lesson_title}  |  {slide.get('title', '')}"
    draw.text((60, 840), footer[:115], font=FONT_SMALL, fill=(100, 116, 139))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, "PNG")


def main() -> None:
    courses = fetch_courses()
    updates: list[dict] = []
    rendered = 0

    for course in courses:
        for module in course.get("modules", []):
            for lesson in module.get("lessons", []):
                slides = sorted(lesson.get("slides", []), key=lambda item: item["order_index"])
                if not slides:
                    continue

                image_urls = [slide.get("image_url", "").strip() for slide in slides]
                if len(set(image_urls)) == len(image_urls):
                    continue

                first_image = next((url for url in image_urls if url), "")
                if not first_image:
                    continue

                slug = slug_from_image_url(first_image, f"lesson-{lesson['id']}")
                slide_count = len(slides)
                for slide in slides:
                    current_url = slide.get("image_url", "").strip()
                    target_name = f"Slide_{slide['order_index']:02d}_lesson_{lesson['id']}.png"
                    target_path = OUTPUT_ROOT / slug / target_name
                    target_url = f"/uploads/course-slides/{slug}/{target_name}"

                    if slide["order_index"] == 1 and current_url != target_url:
                        continue

                    draw_slide_card(
                        target_path,
                        course["title"],
                        module["title"],
                        lesson["title"],
                        slide,
                        slide_count,
                    )
                    updates.append({"slide_id": slide["id"], "image_url": target_url})
                    rendered += 1

    UPDATES_PATH.write_text(json.dumps(updates, indent=2), encoding="utf-8")
    print(f"rendered_slide_cards={rendered}")
    print(f"updates_file={UPDATES_PATH}")


if __name__ == "__main__":
    main()
