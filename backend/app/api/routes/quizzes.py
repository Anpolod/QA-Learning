import json

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user, _require_admin
from app.database.session import get_db
from app.models.entities import Quiz, QuizAnswer, QuizAttempt, QuizQuestion
from app.schemas.quiz import (
    QuizQuestionCreateRequest,
    QuizQuestionCreateResponse,
    QuizQuestionRead,
    QuizQuestionUpdateRequest,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from app.services.progress_service import upsert_lesson_progress

router = APIRouter()


@router.post("/admin/questions", response_model=QuizQuestionCreateResponse)
def create_quiz_question(request: QuizQuestionCreateRequest, authorization: str = Header(default=""), db: Session = Depends(get_db)) -> QuizQuestionCreateResponse:
    _require_admin(authorization, db)
    if len(request.answers) < 2:
        raise HTTPException(status_code=422, detail="A quiz question needs at least two answers.")
    if not any(answer.is_correct for answer in request.answers):
        raise HTTPException(status_code=422, detail="A quiz question needs at least one correct answer.")
    quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == request.lesson_id))
    if not quiz:
        quiz = Quiz(lesson_id=request.lesson_id, title=f"Lesson {request.lesson_id} Quiz")
        db.add(quiz)
        db.flush()
    question = QuizQuestion(
        quiz_id=quiz.id,
        question=request.question,
        question_type=request.question_type,
        explanation=request.explanation,
    )
    db.add(question)
    db.flush()
    answer_ids: list[int] = []
    for answer in request.answers:
        quiz_answer = QuizAnswer(question_id=question.id, answer_text=answer.answer_text, is_correct=answer.is_correct)
        db.add(quiz_answer)
        db.flush()
        answer_ids.append(quiz_answer.id)
    db.commit()
    return QuizQuestionCreateResponse(quiz_id=quiz.id, question_id=question.id, answer_ids=answer_ids)


@router.patch("/admin/questions/{question_id}", response_model=QuizQuestionRead)
def update_quiz_question(question_id: int, request: QuizQuestionUpdateRequest, authorization: str = Header(default=""), db: Session = Depends(get_db)) -> QuizQuestionRead:
    _require_admin(authorization, db)
    question = db.get(QuizQuestion, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Quiz question not found")
    data = request.model_dump(exclude_unset=True)
    if "question" in data and data["question"] is not None:
        question.question = data["question"]
    if "question_type" in data and data["question_type"] is not None:
        question.question_type = data["question_type"]
    if "explanation" in data and data["explanation"] is not None:
        question.explanation = data["explanation"]
    answer_ids: list[int] = []
    if request.answers is not None:
        if len(request.answers) < 2:
            raise HTTPException(status_code=422, detail="A quiz question needs at least two answers.")
        if not any(answer.is_correct for answer in request.answers):
            raise HTTPException(status_code=422, detail="A quiz question needs at least one correct answer.")
        existing = db.scalars(select(QuizAnswer).where(QuizAnswer.question_id == question_id)).all()
        for answer in existing:
            db.delete(answer)
        db.flush()
        for answer in request.answers:
            quiz_answer = QuizAnswer(question_id=question_id, answer_text=answer.answer_text, is_correct=answer.is_correct)
            db.add(quiz_answer)
            db.flush()
            answer_ids.append(quiz_answer.id)
    else:
        answer_ids = list(db.scalars(select(QuizAnswer.id).where(QuizAnswer.question_id == question_id)).all())
    db.commit()
    db.refresh(question)
    return QuizQuestionRead(
        id=question.id,
        question=question.question,
        question_type=question.question_type,
        explanation=question.explanation,
        answer_ids=answer_ids,
    )


@router.delete("/admin/questions/{question_id}")
def delete_quiz_question(question_id: int, authorization: str = Header(default=""), db: Session = Depends(get_db)) -> dict[str, str | int]:
    _require_admin(authorization, db)
    question = db.get(QuizQuestion, question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Quiz question not found")
    for answer in db.scalars(select(QuizAnswer).where(QuizAnswer.question_id == question_id)).all():
        db.delete(answer)
    db.delete(question)
    db.commit()
    return {"status": "deleted", "questionId": question_id}


@router.get("/lesson/{lesson_id}")
def get_quiz(lesson_id: int, db: Session = Depends(get_db)) -> dict:
    quiz = db.scalar(select(Quiz).where(Quiz.lesson_id == lesson_id))
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = db.scalars(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id)).all()
    return {
        "id": quiz.id,
        "title": quiz.title,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "type": q.question_type,
                "explanation": q.explanation,
                "answers": [
                    {"id": a.id, "answerText": a.answer_text}
                    for a in db.scalars(select(QuizAnswer).where(QuizAnswer.question_id == q.id)).all()
                ],
            }
            for q in questions
        ],
    }


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int,
    request: QuizSubmitRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> QuizSubmitResponse:
    user = _current_user(authorization, db)
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = db.scalars(select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)).all()
    score = 0
    wrong: list[dict[str, str]] = []
    for question in questions:
        correct_ids = {
            answer.id for answer in db.scalars(select(QuizAnswer).where(QuizAnswer.question_id == question.id, QuizAnswer.is_correct)).all()
        }
        selected = set(request.answers.get(question.id, []))
        if selected == correct_ids:
            score += 1
        else:
            wrong.append({"question": question.question, "explanation": question.explanation})
    db.add(
        QuizAttempt(
            quiz_id=quiz_id,
            user_id=user.id,
            score=score,
            total_questions=len(questions),
            answers_json=json.dumps(request.answers),
        )
    )
    # Lesson completion is derived (quiz + homework both done) inside
    # upsert_lesson_progress — don't force it on quiz score alone.
    upsert_lesson_progress(
        db,
        user_id=user.id,
        lesson_id=quiz.lesson_id,
        opened=True,
        quiz_completed=True,
    )
    db.commit()
    return QuizSubmitResponse(score=score, total=len(questions), wrong_answers=wrong)
