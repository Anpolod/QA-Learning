from pathlib import Path

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import Lesson, LessonSlide


SLIDE_ROOT = Path("uploads/course-slides")

DECK_LESSON_MAP = {
    "api-testing": [
        "API testing basics",
        "REST API basics",
        "Postman basics",
        "HTTP methods",
        "HTTP status codes",
    ],
    "architecting-quality": [
        "Software Development Life Cycle - SDLC",
        "Agile / Scrum basics",
        "CI/CD basics",
    ],
    "blueprint-to-flow": [
        "Software Testing Life Cycle - STLC",
        "Requirements analysis",
        "Test scenarios",
    ],
    "defect-management-blueprint": [
        "Bug reports",
        "Bug life cycle",
        "AI for generating bug reports",
    ],
    "git-transit": [
        "Git basics for QA",
        "GitHub Actions",
    ],
    "mobile-testing": [
        "Mobile testing basics",
        "Compatibility testing",
    ],
    "playwright-ui-automation": [
        "Playwright basics",
        "Browser automation",
        "Locators",
        "Assertions",
        "Waiting strategies",
        "Playwright API testing",
        "AI for Playwright tests",
    ],
    "qa-sql-essentials": [
        "SQL basics for QA",
        "SELECT queries",
        "Filtering data",
        "JOIN basics",
        "AI for SQL query help",
    ],
    "qa-terminal-survival": [
        "Docker basics",
        "Environment variables",
        "Test configuration",
        "Debugging failed tests",
    ],
    "scalable-qa-documentation": [
        "Test cases",
        "Checklists",
        "QA documentation",
        "Test summary report",
        "AI for test documentation",
        "AI for test summary reports",
    ],
    "the-invisible-blueprint": [
        "What is software testing",
        "Test design techniques",
        "Equivalence partitioning",
        "Boundary value analysis",
    ],
    "qa-career": [
        "Final Manual QA project",
        "Final Automation QA project",
        "Final AI QA project",
    ],
    "team-composition": [
        "How QA engineers can use AI",
        "AI agents in QA workflow",
    ],
    "qa-field-guide": [
        "QA / QC / Testing basics",
        "Types of testing",
        "Functional testing",
        "Non-functional testing",
    ],
    "smoke-testing": [
        "Smoke testing",
    ],
    "sanity-testing": [
        "Sanity testing",
    ],
    "regression-testing": [
        "Regression testing",
    ],
    "retesting": [
        "Retesting",
    ],
    "exploratory-testing": [
        "Exploratory testing",
    ],
    "usability-testing": [
        "Usability testing",
    ],
    "cross-browser-testing": [
        "Cross-browser testing",
    ],
    "web-testing-basics": [
        "Web testing basics",
    ],
    "test-plan": [
        "Test plan",
    ],
    "test-strategy": [
        "Test strategy",
    ],
    "decision-table-testing": [
        "Decision table testing",
    ],
    "state-transition-testing": [
        "State transition testing",
    ],
    "pairwise-testing": [
        "Pairwise testing",
    ],
    "json-basics": [
        "JSON basics",
    ],
    "jira-basics": [
        "Jira basics",
    ],
    "programming-basics-for-qa": [
        "Programming basics for QA",
    ],
    "python-or-javascript-basics": [
        "Python or JavaScript basics",
    ],
    "variables": [
        "Variables",
    ],
    "data-types": [
        "Data types",
    ],
    "conditions": [
        "Conditions",
    ],
    "loops": [
        "Loops",
    ],
    "functions": [
        "Functions",
    ],
    "classes-and-oop-basics": [
        "Classes and OOP basics",
    ],
    "working-with-files": [
        "Working with files",
    ],
    "error-handling": [
        "Error handling",
    ],
    "html-basics": [
        "HTML basics",
    ],
    "css-basics": [
        "CSS basics",
    ],
    "dom-basics": [
        "DOM basics",
    ],
    "browser-devtools": [
        "Browser DevTools",
    ],
    "xpath-selectors": [
        "XPath selectors",
    ],
    "css-selectors": [
        "CSS selectors",
    ],
    "selenium-basics": [
        "Selenium basics",
    ],
    "page-object-model": [
        "Page Object Model",
    ],
    "fixtures": [
        "Fixtures",
    ],
    "test-data": [
        "Test data",
    ],
    "test-structure": [
        "Test structure",
    ],
    "api-automation": [
        "API automation",
    ],
    "selenium-test-examples": [
        "Selenium test examples",
    ],
    "reports": [
        "Reports",
    ],
    "allure-reports": [
        "Allure reports",
    ],
    "screenshots-and-videos": [
        "Screenshots and videos",
    ],
    "parallel-test-execution": [
        "Parallel test execution",
    ],
    "what-is-ai-in-qa": [
        "What is AI in QA",
    ],
    "risks-and-limits-of-ai-in-qa": [
        "Risks and limits of AI in QA",
    ],
    "prompt-engineering-for-qa": [
        "Prompt engineering for QA",
    ],
    "ai-for-requirements-analysis": [
        "AI for requirements analysis",
    ],
    "ai-for-generating-test-cases": [
        "AI for generating test cases",
    ],
    "ai-for-generating-checklists": [
        "AI for generating checklists",
    ],
    "ai-for-test-design-techniques": [
        "AI for test design techniques",
    ],
    "ai-for-api-testing": [
        "AI for API testing",
    ],
    "ai-for-xpath-and-css-selectors": [
        "AI for XPath and CSS selectors",
    ],
    "ai-for-automation-scripts": [
        "AI for automation scripts",
    ],
    "ai-for-selenium-tests": [
        "AI for Selenium tests",
    ],
    "ai-for-debugging-failed-tests": [
        "AI for debugging failed tests",
    ],
    "ai-for-code-review": [
        "AI for code review",
    ],
    "ai-for-test-data-generation": [
        "AI for test data generation",
    ],
    "ai-for-mock-data": [
        "AI for mock data",
    ],
    "how-to-verify-ai-generated-tests": [
        "How to verify AI-generated tests",
    ],
}


def _deck_images(deck_slug: str) -> list[Path]:
    deck_dir = SLIDE_ROOT / deck_slug
    if not deck_dir.exists():
        return []
    return sorted(deck_dir.glob("Slide_*.png"))


def import_slide_assets() -> None:
    db = SessionLocal()
    try:
        updated = 0
        missing_decks: list[str] = []
        missing_lessons: list[str] = []
        for deck_slug, lesson_titles in DECK_LESSON_MAP.items():
            images = _deck_images(deck_slug)
            if not images:
                missing_decks.append(deck_slug)
                continue
            for lesson_title in lesson_titles:
                lessons = list(db.scalars(select(Lesson).where(Lesson.title == lesson_title)).all())
                if not lessons:
                    missing_lessons.append(lesson_title)
                    continue
                for lesson in lessons:
                    slides = list(
                        db.scalars(
                            select(LessonSlide)
                            .where(LessonSlide.lesson_id == lesson.id)
                            .order_by(LessonSlide.order_index)
                        ).all()
                    )
                    seeded_slides = [
                        slide
                        for slide in slides
                        if 1 <= slide.order_index <= 5 and not slide.title.lower().startswith("admin ")
                    ]
                    for slide in slides:
                        if slide not in seeded_slides and slide.image_url.startswith("/uploads/course-slides/"):
                            slide.image_url = ""
                            updated += 1
                    for index, slide in enumerate(seeded_slides):
                        if index >= len(images):
                            break
                        relative_path = images[index].as_posix().replace("uploads/", "/uploads/", 1)
                        if slide.image_url != relative_path:
                            slide.image_url = relative_path
                            updated += 1
        db.commit()
        print(f"updated_slide_images={updated}")
        if missing_decks:
            print("missing_decks=" + ",".join(sorted(set(missing_decks))))
        if missing_lessons:
            print("missing_lessons=" + ",".join(sorted(set(missing_lessons))))
    finally:
        db.close()


if __name__ == "__main__":
    import_slide_assets()
