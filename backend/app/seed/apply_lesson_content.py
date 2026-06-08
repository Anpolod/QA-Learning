"""Apply authored lesson content from backend/app/seed/content/*.json to the database.

Each JSON file is a list of lesson objects keyed by lesson title. This upserts the
text fields, the practical example, the interactive task, the homework, and the quiz.
Slides are intentionally left untouched so generated slide images are preserved.

Idempotent: re-running replaces example/task/homework/quiz and overwrites text fields.

Run inside the backend container:
    python -m app.seed.apply_lesson_content
"""

import json
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.entities import (
    Homework,
    Lesson,
    LessonExample,
    LessonInteractiveTask,
    Quiz,
    QuizAnswer,
    QuizQuestion,
)

CONTENT_DIR = Path(__file__).parent / "content"

TEXT_FIELDS = [
    "short_description",
    "learning_goals",
    "theory",
    "key_terms",
    "real_world_example",
    "step_by_step",
    "common_mistakes",
    "practical_use_case",
    "summary",
]


def _load_content() -> dict[str, dict]:
    by_title: dict[str, dict] = {}
    if not CONTENT_DIR.exists():
        raise SystemExit(f"Content dir not found: {CONTENT_DIR}")
    for path in sorted(CONTENT_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for lesson in data:
            by_title[lesson["title"]] = lesson
    return by_title


def _replace_quiz(db: Session, quiz: Quiz, questions: list[dict]) -> None:
    question_ids = list(db.scalars(select(QuizQuestion.id).where(QuizQuestion.quiz_id == quiz.id)).all())
    if question_ids:
        db.execute(delete(QuizAnswer).where(QuizAnswer.question_id.in_(question_ids)))
        db.execute(delete(QuizQuestion).where(QuizQuestion.id.in_(question_ids)))
    for q in questions:
        answers = q["answers"]
        correct = int(q["correct_index"])
        question = QuizQuestion(
            quiz_id=quiz.id,
            question=q["question"],
            question_type="single",
            explanation=f"Correct answer: {answers[correct]}",
        )
        db.add(question)
        db.flush()
        for index, answer in enumerate(answers):
            db.add(QuizAnswer(question_id=question.id, answer_text=answer, is_correct=index == correct))


def apply_lesson_content() -> None:
    db = SessionLocal()
    content = _load_content()
    updated = 0
    missing: list[str] = []
    try:
        for title, c in content.items():
            lesson = db.scalar(select(Lesson).where(Lesson.title == title))
            if not lesson:
                missing.append(title)
                continue

            for field in TEXT_FIELDS:
                if c.get(field) is not None:
                    setattr(lesson, field, c[field])

            if c.get("example"):
                example = db.scalar(select(LessonExample).where(LessonExample.lesson_id == lesson.id))
                if example:
                    example.title = c.get("example_title", "Practical workplace example")
                    example.content = c["example"]
                else:
                    db.add(
                        LessonExample(
                            lesson_id=lesson.id,
                            title=c.get("example_title", "Practical workplace example"),
                            content=c["example"],
                        )
                    )

            if c.get("interactive"):
                task = db.scalar(select(LessonInteractiveTask).where(LessonInteractiveTask.lesson_id == lesson.id))
                if task:
                    task.task_type = c.get("task_type", "analysis")
                    task.prompt = c["interactive"]
                    task.expected_answer = c.get("expected_answer", "")
                else:
                    db.add(
                        LessonInteractiveTask(
                            lesson_id=lesson.id,
                            task_type=c.get("task_type", "analysis"),
                            prompt=c["interactive"],
                            expected_answer=c.get("expected_answer", ""),
                        )
                    )

            if c.get("homework"):
                homework = db.scalar(select(Homework).where(Homework.lesson_id == lesson.id))
                if homework:
                    homework.task_description = c["homework"]
                    homework.expected_result = c.get("expected_result", "")
                else:
                    db.add(
                        Homework(
                            lesson_id=lesson.id,
                            task_description=c["homework"],
                            expected_result=c.get("expected_result", ""),
                        )
                    )

            if c.get("quiz"):
                quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == lesson.id))
                if not quiz:
                    quiz = Quiz(lesson_id=lesson.id, title=f"{lesson.title} Quiz")
                    db.add(quiz)
                    db.flush()
                _replace_quiz(db, quiz, c["quiz"])

            updated += 1
        db.commit()
        print(f"applied_lessons={updated}")
        if missing:
            print(f"missing_titles={len(missing)}: {missing}")
    finally:
        db.close()


if __name__ == "__main__":
    apply_lesson_content()
