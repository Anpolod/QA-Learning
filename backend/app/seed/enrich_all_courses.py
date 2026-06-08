from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.entities import (
    Course,
    Homework,
    Lesson,
    LessonExample,
    LessonInteractiveTask,
    LessonSlide,
    Module,
    Quiz,
    QuizAnswer,
    QuizQuestion,
)
from app.seed.seed_data import COURSE_BLUEPRINTS


PRESERVE_TITLES = {
    "QA / QC / Testing basics",
    "What is software testing",
    "Software Development Life Cycle - SDLC",
    "Software Testing Life Cycle - STLC",
    "SDLC and STLC",
}


def _find_course_context(title: str) -> tuple[str, str, str]:
    for course in COURSE_BLUEPRINTS:
        for module in course["modules"]:
            if title in module["lessons"]:
                return course["title"], module["title"], module["description"]
    return "QA", "QA Skills", "Build practical QA skills through theory, examples, practice, homework, and quiz checks."


def _focus(title: str, course_title: str) -> str:
    lower = title.lower()
    if "final" in lower and "project" in lower:
        return "integrating multiple course skills into a portfolio-ready QA project"
    if course_title == "QA Automation":
        if any(word in lower for word in ["playwright", "selenium", "browser", "locator", "assertion", "waiting"]):
            return "writing stable browser automation that checks real user behavior"
        if any(word in lower for word in ["python", "javascript", "variables", "data types", "conditions", "loops", "functions", "classes", "files", "error"]):
            return "using programming fundamentals to create readable automated tests"
        if any(word in lower for word in ["api", "reports", "allure", "ci", "github", "docker", "environment", "configuration", "parallel"]):
            return "running automation reliably in team and CI environments"
        return "building maintainable automated checks"
    if course_title == "AI for QA":
        if "risk" in lower or "verify" in lower or "limits" in lower:
            return "using AI responsibly while keeping human QA judgment in control"
        if any(word in lower for word in ["generating", "test cases", "checklists", "bug reports", "documentation", "summary"]):
            return "turning requirements and QA artifacts into structured AI-assisted drafts"
        if any(word in lower for word in ["api", "sql", "xpath", "css", "automation", "playwright", "selenium", "debugging", "code review"]):
            return "using AI to support technical QA work without trusting output blindly"
        return "adding AI assistance to a practical QA workflow"
    if any(word in lower for word in ["api", "rest", "postman", "http", "json"]):
        return "checking backend behavior through requests, responses, status codes, and data"
    if any(word in lower for word in ["sql", "select", "filtering", "join"]):
        return "verifying data directly with simple database queries"
    if any(word in lower for word in ["bug", "defect"]):
        return "communicating defects clearly so the team can reproduce, prioritize, and fix them"
    if any(word in lower for word in ["test cases", "checklists", "documentation", "summary", "plan", "strategy"]):
        return "creating QA documentation that makes testing clear, repeatable, and traceable"
    if any(word in lower for word in ["boundary", "equivalence", "decision", "state", "pairwise", "design techniques"]):
        return "designing stronger tests from requirements, rules, states, and input combinations"
    return "choosing practical manual testing activities based on risk and expected behavior"


def _artifact(title: str, course_title: str) -> str:
    lower = title.lower()
    if course_title == "QA Automation":
        if "api" in lower:
            return "an API automation checklist and one request/response assertion plan"
        if any(word in lower for word in ["playwright", "selenium", "browser", "locator", "assertion"]):
            return "a small UI automation scenario with locators, actions, and assertions"
        if any(word in lower for word in ["ci", "github", "docker", "reports", "allure"]):
            return "a short automation execution plan for local and CI runs"
        return "a small code-oriented testing exercise"
    if course_title == "AI for QA":
        return "an AI prompt, a generated draft, and a human review checklist"
    if any(word in lower for word in ["bug", "defect"]):
        return "a reproducible bug report with evidence and priority reasoning"
    if "api" in lower or "rest" in lower or "postman" in lower:
        return "an API test scenario with method, endpoint, request data, expected status, and response checks"
    if "sql" in lower or "select" in lower or "join" in lower or "filtering" in lower:
        return "a SQL verification query with expected data result"
    if any(word in lower for word in ["test cases", "scenarios", "checklists"]):
        return "a small set of scenarios, test cases, or checklist items"
    return "a concise QA artifact that includes goal, steps, expected result, and evidence"


def _content_for(title: str) -> dict[str, str | list[tuple[str, str]] | list[tuple[str, list[str], int]]]:
    course_title, module_title, module_description = _find_course_context(title)
    focus = _focus(title, course_title)
    artifact = _artifact(title, course_title)
    product = "checkout, login, profile, search, or order history"

    learning_goals = "\n".join(
        [
            f"Explain what {title} means in a real QA workflow.",
            f"Identify where {title} is useful in {course_title}.",
            f"Apply {title} to a realistic product feature.",
            f"Create {artifact}.",
        ]
    )
    theory = (
        f"{title} is part of the {module_title} module in the {course_title} course. The practical goal is {focus}. "
        f"A QA engineer should not treat this topic as theory only. It should help answer concrete team questions: "
        f"what should happen, what can go wrong, how important the risk is, and what evidence is needed.\n\n"
        f"In practice, {title} starts with context. Read the requirement, identify the user goal, check the business rule, "
        f"and decide what information the team needs before release. Then turn that thinking into a clear testing artifact: "
        f"{artifact}. Good work is specific enough that another QA engineer can repeat it and a developer can understand "
        f"the expected behavior.\n\n"
        f"Use {title} with a risk-based mindset. Prioritize user-critical flows, recently changed code, data loss, payments, "
        f"security, integrations, and confusing edge cases. The result should be useful communication, not just a checked box."
    )
    key_terms = (
        f"{title}: a QA skill used for {focus}.\n"
        "Requirement: a statement of expected product behavior or constraint.\n"
        "Risk: potential impact if the product behaves incorrectly.\n"
        "Expected result: what should happen when the check is executed.\n"
        "Actual result: what really happens during testing.\n"
        "Evidence: screenshots, logs, API responses, test reports, database rows, or clear notes."
    )
    real_world_example = (
        f"A team changes the {product} feature before a release. The QA engineer uses {title} to focus the work: "
        f"understand the expected behavior, choose meaningful checks, document results, and communicate remaining risk."
    )
    step_by_step = "\n".join(
        [
            "1. Read the requirement or task description.",
            "2. Identify the user goal and business rule.",
            "3. List the main risks and edge cases.",
            f"4. Create {artifact}.",
            "5. Execute or review the work with realistic test data.",
            "6. Compare actual behavior with expected behavior.",
            "7. Save evidence and communicate the result clearly.",
        ]
    )
    common_mistakes = "\n".join(
        [
            "Mistake 1: Working without clear expected results.",
            "Mistake 2: Testing only the happy path and ignoring edge cases.",
            "Mistake 3: Writing vague notes that another person cannot reproduce.",
            "Mistake 4: Missing evidence such as screenshots, logs, API responses, or test output.",
            "Mistake 5: Treating all risks as equal instead of prioritizing user and business impact.",
        ]
    )
    practical_use_case = (
        f"Use this topic when a feature is ready for review and the team needs structured QA input. For example, apply "
        f"{title} to a login or checkout story and produce {artifact}."
    )
    summary = (
        f"{title} helps QA engineers make testing more focused, repeatable, and useful. The key is to connect the topic "
        f"to product risk, expected behavior, clear evidence, and communication the team can act on."
    )
    slides = [
        (f"{title}: Purpose", f"Use this topic to support {focus}."),
        ("Start With Context", "Read the requirement, user goal, and business rule before designing checks."),
        ("Think in Risks", "Prioritize critical flows, recent changes, data, integrations, and edge cases."),
        ("Create Clear Evidence", f"Produce {artifact} with expected results and evidence."),
        ("Communicate the Result", "Share what was checked, what failed, what passed, and what risk remains."),
    ]
    example = (
        f"Scenario: A new change affects the {product} feature.\n\n"
        f"Task: Use {title} to analyze the feature.\n\n"
        "Strong QA output includes:\n"
        "- the user goal;\n"
        "- the expected behavior;\n"
        "- important risks;\n"
        "- realistic test data;\n"
        "- evidence to collect;\n"
        f"- {artifact}."
    )
    interactive = (
        f"Apply {title} to this requirement: 'A registered user can update their profile email and must receive a "
        "confirmation message.' Identify 3 risks, 3 checks, and the evidence you would collect."
    )
    expected_answer = (
        "A strong answer includes risks such as invalid email format, duplicate email, missing confirmation, or session issues; "
        "checks with clear expected results; and evidence such as screenshots, network responses, database state, or logs."
    )
    homework = (
        f"Choose one feature from a web application and apply {title}. Submit {artifact}. Include context, risks, expected "
        "results, test data, and evidence you would collect."
    )
    expected_result = (
        f"A clear {course_title} homework submission that applies {title} to a realistic feature and can be reviewed by another QA engineer."
    )
    quiz = [
        (f"What is the main purpose of {title}?", [f"To support {focus}", "To replace all requirements", "To avoid documenting results", "To test randomly"], 0),
        ("What should QA understand before applying the topic?", ["Requirement, user goal, and expected behavior", "Only the button color", "Only the release date", "Nothing"], 0),
        ("Which testing mindset is most useful?", ["Risk-based prioritization", "Random clicking", "Ignoring edge cases", "Testing without notes"], 0),
        ("What makes QA output useful for the team?", ["Clear steps, expected results, and evidence", "Personal opinion only", "No context", "Hidden results"], 0),
        ("Which area should usually be tested early?", ["User-critical and recently changed flows", "Only old unused screens", "Only decorative icons", "Nothing until production"], 0),
        ("What is an expected result?", ["What should happen", "What really happened", "A random guess", "A file name only"], 0),
        ("What is evidence in QA work?", ["Screenshots, logs, API responses, reports, or clear notes", "A vague feeling", "A meeting title", "A color palette"], 0),
        ("What is a common mistake?", ["Testing only the happy path", "Collecting evidence", "Reading requirements", "Writing clear notes"], 0),
        (f"What should homework for {title} include?", ["Context, risks, expected results, data, and evidence", "Only one sentence", "Only a screenshot without steps", "Only a title"], 0),
        ("How should QA communicate remaining risk?", ["Clearly, with what was checked and what still concerns the team", "By hiding uncertainty", "By deleting failed results", "By saying everything is perfect"], 0),
    ]
    return {
        "short_description": f"Practice {title} through realistic QA workflow, examples, homework, and quiz checks.",
        "learning_goals": learning_goals,
        "theory": theory,
        "key_terms": key_terms,
        "real_world_example": real_world_example,
        "step_by_step": step_by_step,
        "common_mistakes": common_mistakes,
        "practical_use_case": practical_use_case,
        "summary": summary,
        "slides": slides,
        "example": example,
        "interactive": interactive,
        "expected_answer": expected_answer,
        "homework": homework,
        "expected_result": expected_result,
        "quiz": quiz,
    }


def _blueprint_titles() -> set[str]:
    titles: set[str] = set()
    for course in COURSE_BLUEPRINTS:
        for module in course["modules"]:
            titles.update(module["lessons"])
    return titles


def _is_generic_lesson(lesson: Lesson) -> bool:
    generic_fragments = [
        "is an essential QA topic",
        "Add the full theory explanation",
        "Define clear learning goals",
        "Testing without clear expected results, skipping edge cases",
    ]
    return any(fragment in lesson.theory or fragment in lesson.learning_goals or fragment in lesson.common_mistakes for fragment in generic_fragments)


def _replace_quiz(db: Session, quiz: Quiz, questions: list[tuple[str, list[str], int]]) -> None:
    question_ids = list(db.scalars(select(QuizQuestion.id).where(QuizQuestion.quiz_id == quiz.id)).all())
    if question_ids:
        db.execute(delete(QuizAnswer).where(QuizAnswer.question_id.in_(question_ids)))
        db.execute(delete(QuizQuestion).where(QuizQuestion.id.in_(question_ids)))
    for question_text, answers, correct_index in questions:
        question = QuizQuestion(
            quiz_id=quiz.id,
            question=question_text,
            question_type="single",
            explanation=f"Correct answer: {answers[correct_index]}",
        )
        db.add(question)
        db.flush()
        for index, answer in enumerate(answers):
            db.add(QuizAnswer(question_id=question.id, answer_text=answer, is_correct=index == correct_index))


def _seeded_slides(db: Session, lesson: Lesson) -> list[LessonSlide]:
    slides = list(
        db.scalars(select(LessonSlide).where(LessonSlide.lesson_id == lesson.id).order_by(LessonSlide.order_index)).all()
    )
    return [slide for slide in slides if slide.title.startswith(f"{lesson.title}: Slide ")]


def enrich_all_courses() -> None:
    db = SessionLocal()
    titles = _blueprint_titles()
    try:
        updated = 0
        skipped = 0
        stmt = (
            select(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .join(Course, Course.id == Module.course_id)
            .order_by(Course.id, Module.order_index, Lesson.order_index)
        )
        for lesson in db.scalars(stmt).all():
            if lesson.title not in titles:
                skipped += 1
                continue
            if lesson.title in PRESERVE_TITLES and not _is_generic_lesson(lesson):
                skipped += 1
                continue
            if not _is_generic_lesson(lesson):
                skipped += 1
                continue

            content = _content_for(lesson.title)
            for field in [
                "short_description",
                "learning_goals",
                "theory",
                "key_terms",
                "real_world_example",
                "step_by_step",
                "common_mistakes",
                "practical_use_case",
                "summary",
            ]:
                setattr(lesson, field, content[field])

            for slide, (slide_title, slide_body) in zip(_seeded_slides(db, lesson), content["slides"]):
                slide.title = slide_title
                slide.body = slide_body

            example = db.scalar(select(LessonExample).where(LessonExample.lesson_id == lesson.id))
            if example:
                example.title = "Practical workplace example"
                example.content = content["example"]
            else:
                db.add(LessonExample(lesson_id=lesson.id, title="Practical workplace example", content=content["example"]))

            task = db.scalar(select(LessonInteractiveTask).where(LessonInteractiveTask.lesson_id == lesson.id))
            if task:
                task.task_type = "analysis"
                task.prompt = content["interactive"]
                task.expected_answer = content["expected_answer"]
            else:
                db.add(
                    LessonInteractiveTask(
                        lesson_id=lesson.id,
                        task_type="analysis",
                        prompt=content["interactive"],
                        expected_answer=content["expected_answer"],
                    )
                )

            homework = db.scalar(select(Homework).where(Homework.lesson_id == lesson.id))
            if homework:
                homework.task_description = content["homework"]
                homework.expected_result = content["expected_result"]
            else:
                db.add(
                    Homework(
                        lesson_id=lesson.id,
                        task_description=content["homework"],
                        expected_result=content["expected_result"],
                    )
                )

            quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == lesson.id))
            if not quiz:
                quiz = Quiz(lesson_id=lesson.id, title=f"{lesson.title} Quiz")
                db.add(quiz)
                db.flush()
            _replace_quiz(db, quiz, content["quiz"])
            updated += 1

        db.commit()
        print(f"updated_lessons={updated}")
        print(f"skipped_lessons={skipped}")
    finally:
        db.close()


if __name__ == "__main__":
    enrich_all_courses()
