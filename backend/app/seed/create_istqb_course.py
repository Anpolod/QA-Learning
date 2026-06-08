"""Idempotently create the ISTQB CTFL Foundation course (course + modules + empty lessons).

Lesson text fields are created empty; run apply_lesson_content afterwards to fill them
from backend/app/seed/content/istqb_*.json (those lesson objects carry "section": "istqb").

    python -m app.seed.create_istqb_course
    python -m app.seed.apply_lesson_content
"""

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module

SECTION = "istqb"
COURSE_TITLE = "ISTQB Foundation (CTFL)"
COURSE_DESCRIPTION = (
    "Prepare for the ISTQB Certified Tester Foundation Level (CTFL v4.0). "
    "Covers the full syllabus — fundamentals, testing through the SDLC, static testing, "
    "test techniques, managing test activities, and tools — plus exam format and mock questions."
)

# (module title, module description, [lesson titles])
STRUCTURE: list[tuple[str, str, list[str]]] = [
    (
        "Fundamentals of Testing",
        "Core concepts: what testing is, why it is needed, the seven principles, the test process, and tester skills.",
        [
            "What is testing",
            "Why is testing necessary",
            "Testing principles",
            "Test activities, testware and roles",
            "Essential skills and good practices in testing",
        ],
    ),
    (
        "Testing Throughout the SDLC",
        "How testing fits software development: lifecycle models, test levels and types, maintenance, and DevOps.",
        [
            "SDLC models and testing",
            "Test levels",
            "Test types",
            "Maintenance testing",
            "Testing and DevOps",
        ],
    ),
    (
        "Static Testing",
        "Finding defects without executing code: static analysis, the review process, and review techniques.",
        [
            "Static testing basics",
            "Feedback and the review process",
            "Review techniques",
        ],
    ),
    (
        "Test Analysis and Design",
        "Designing tests: black-box, white-box, experience-based, and collaboration-based techniques.",
        [
            "Test techniques overview",
            "Equivalence Partitioning",
            "Boundary Value Analysis",
            "Decision Table Testing",
            "State Transition Testing",
            "Statement and Branch coverage",
            "Experience-based test techniques",
            "Collaboration-based test approaches",
        ],
    ),
    (
        "Managing the Test Activities",
        "Planning, risk, monitoring, configuration management, and defect management.",
        [
            "Test planning and estimation",
            "Risk management in testing",
            "Test monitoring, control and completion",
            "Configuration management",
            "Defect management",
        ],
    ),
    (
        "Test Tools",
        "Tool support for testing and the benefits and risks of test automation.",
        [
            "Tool support for testing",
            "Benefits and risks of test automation",
        ],
    ),
    (
        "Exam Preparation",
        "ISTQB exam format, K-levels, and a mock exam with explained answers.",
        [
            "ISTQB exam format and K-levels",
            "Mock exam: questions and answers",
        ],
    ),
]

EMPTY_TEXT_FIELDS = {
    "short_description": "",
    "learning_goals": "",
    "theory": "",
    "key_terms": "",
    "real_world_example": "",
    "step_by_step": "",
    "common_mistakes": "",
    "practical_use_case": "",
    "summary": "",
}


def create_istqb_course() -> None:
    db = SessionLocal()
    created_modules = 0
    created_lessons = 0
    try:
        course = db.scalar(select(Course).where(Course.section == SECTION))
        if not course:
            course = Course(title=COURSE_TITLE, section=SECTION, description=COURSE_DESCRIPTION)
            db.add(course)
            db.flush()
            print(f"created course: {COURSE_TITLE} (section={SECTION})")
        else:
            print(f"course exists: {course.title}")

        for m_index, (mod_title, mod_desc, lessons) in enumerate(STRUCTURE, start=1):
            module = db.scalar(
                select(Module).where(Module.course_id == course.id, Module.title == mod_title)
            )
            if not module:
                module = Module(course_id=course.id, title=mod_title, description=mod_desc, order_index=m_index)
                db.add(module)
                db.flush()
                created_modules += 1
            for l_index, lesson_title in enumerate(lessons, start=1):
                exists = db.scalar(
                    select(Lesson).where(Lesson.module_id == module.id, Lesson.title == lesson_title)
                )
                if exists:
                    continue
                db.add(
                    Lesson(module_id=module.id, title=lesson_title, order_index=l_index, **EMPTY_TEXT_FIELDS)
                )
                created_lessons += 1

        db.commit()
        print(f"created_modules={created_modules}")
        print(f"created_lessons={created_lessons}")
    finally:
        db.close()


if __name__ == "__main__":
    create_istqb_course()
