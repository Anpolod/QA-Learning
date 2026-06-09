from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user, _require_admin
from app.database.session import get_db
from app.models.entities import Homework, HomeworkSubmission, Lesson
from app.schemas.homework import (
    HomeworkCreateRequest,
    HomeworkRead,
    HomeworkReviewRequest,
    HomeworkSubmissionRead,
    HomeworkUpdateRequest,
)
from app.services.progress_service import upsert_lesson_progress

router = APIRouter()


class HomeworkSubmitRequest(BaseModel):
    user_id: int | None = None  # ignored; attributed to the authenticated user
    answer_text: str


def _submission_read(submission: HomeworkSubmission) -> HomeworkSubmissionRead:
    return HomeworkSubmissionRead(
        id=submission.id,
        homework_id=submission.homework_id,
        user_id=submission.user_id,
        answer_text=submission.answer_text,
        file_url=submission.file_url,
        status=submission.status,
        created_at=submission.created_at.isoformat(),
    )


@router.get("/submissions", response_model=list[HomeworkSubmissionRead])
def list_homework_submissions(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> list[HomeworkSubmissionRead]:
    _require_admin(authorization, db)
    submissions = db.scalars(select(HomeworkSubmission).order_by(HomeworkSubmission.created_at.desc()).limit(50)).all()
    return [_submission_read(submission) for submission in submissions]


@router.post("/admin", response_model=HomeworkRead)
def create_homework(
    request: HomeworkCreateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> Homework:
    _require_admin(authorization, db)
    lesson = db.get(Lesson, request.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    existing = db.scalar(select(Homework).where(Homework.lesson_id == request.lesson_id))
    if existing:
        existing.task_description = request.task_description
        existing.expected_result = request.expected_result
        existing.allow_file_upload = request.allow_file_upload
        db.commit()
        db.refresh(existing)
        return existing
    homework = Homework(
        lesson_id=request.lesson_id,
        task_description=request.task_description,
        expected_result=request.expected_result,
        allow_file_upload=request.allow_file_upload,
    )
    db.add(homework)
    db.commit()
    db.refresh(homework)
    return homework


@router.patch("/admin/{homework_id}", response_model=HomeworkRead)
def update_homework(
    homework_id: int,
    request: HomeworkUpdateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> Homework:
    _require_admin(authorization, db)
    homework = db.get(Homework, homework_id)
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(homework, field, value)
    db.commit()
    db.refresh(homework)
    return homework


@router.patch("/submissions/{submission_id}/review", response_model=HomeworkSubmissionRead)
def review_homework_submission(
    submission_id: int,
    request: HomeworkReviewRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> HomeworkSubmissionRead:
    _require_admin(authorization, db)
    if request.status not in {"approved", "needs_changes", "submitted"}:
        raise HTTPException(status_code=422, detail="Invalid homework review status.")
    submission = db.get(HomeworkSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Homework submission not found")
    submission.status = request.status
    db.commit()
    db.refresh(submission)
    return _submission_read(submission)


@router.get("/lesson/{lesson_id}", response_model=HomeworkRead)
def get_homework(lesson_id: int, db: Session = Depends(get_db)) -> Homework:
    homework = db.scalar(select(Homework).where(Homework.lesson_id == lesson_id))
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    return homework


@router.post("/{homework_id}/submit")
def submit_homework(
    homework_id: int,
    request: HomeworkSubmitRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> dict[str, str | int]:
    user = _current_user(authorization, db)
    homework = db.get(Homework, homework_id)
    if not homework:
        raise HTTPException(status_code=404, detail="Homework not found")
    submission = HomeworkSubmission(homework_id=homework_id, user_id=user.id, answer_text=request.answer_text)
    db.add(submission)
    upsert_lesson_progress(db, user_id=user.id, lesson_id=homework.lesson_id, opened=True, homework_submitted=True)
    db.commit()
    db.refresh(submission)
    return {"status": "submitted", "submissionId": submission.id}
