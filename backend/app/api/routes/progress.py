from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.entities import AiUsageLog, FinalProjectSubmission, Lesson, Module, User, UserProgress
from app.services.gamification_service import sync_user_gamification
from app.services.progress_service import upsert_lesson_progress

router = APIRouter()


class ProgressUpdate(BaseModel):
    user_id: int = 1
    lesson_id: int
    opened: bool | None = None
    completed: bool | None = None
    quiz_completed: bool | None = None
    homework_submitted: bool | None = None


class AdminProgressRow(BaseModel):
    user_id: int
    email: str
    lesson_id: int
    lesson_title: str
    opened: bool
    completed: bool
    quiz_completed: bool
    homework_submitted: bool
    updated_at: str


@router.get("/dashboard/{user_id}")
def dashboard_progress(user_id: int, db: Session = Depends(get_db)) -> dict:
    rows = db.scalars(select(UserProgress).where(UserProgress.user_id == user_id)).all()
    completed_lesson_ids = {row.lesson_id for row in rows if row.completed}
    completed = sum(1 for row in rows if row.completed)
    total_lessons = int(db.scalar(select(func.count(Lesson.id))) or 0)
    recommended = db.scalar(select(Lesson).where(Lesson.id.not_in(completed_lesson_ids)).order_by(Lesson.id)) if completed_lesson_ids else db.scalar(select(Lesson).order_by(Lesson.id))
    latest_progress = db.scalar(select(UserProgress).where(UserProgress.user_id == user_id).order_by(UserProgress.updated_at.desc()))
    current_lesson = db.get(Lesson, latest_progress.lesson_id) if latest_progress else recommended
    current_module = db.get(Module, current_lesson.module_id) if current_lesson else None
    since = datetime.utcnow() - timedelta(days=1)
    ai_usage_today = int(
        db.scalar(select(func.count(AiUsageLog.id)).where(AiUsageLog.user_id == user_id, AiUsageLog.created_at >= since)) or 0
    )
    final_submissions = db.scalars(select(FinalProjectSubmission).where(FinalProjectSubmission.user_id == user_id)).all()
    submitted_project_ids = {submission.final_project_id for submission in final_submissions}
    approved_project_ids = {submission.final_project_id for submission in final_submissions if submission.status == "approved"}
    return {
        "completedLessons": completed,
        "openedLessons": len(rows),
        "quizCompleted": sum(1 for row in rows if row.quiz_completed),
        "homeworkSubmitted": sum(1 for row in rows if row.homework_submitted),
        "totalLessons": total_lessons,
        "currentModule": current_module.title if current_module else "Start learning",
        "currentLesson": current_lesson.title if current_lesson else "QA / QC / Testing basics",
        "recommendedNextLesson": recommended.title if recommended else "Certificate readiness",
        "recommendedLessonId": recommended.id if recommended else None,
        "aiUsageToday": ai_usage_today,
        "aiDailyLimit": settings.ai_daily_limit_per_user,
        "finalProjectsSubmitted": len(submitted_project_ids),
        "finalProjectsApproved": len(approved_project_ids),
        "totalFinalProjects": 3,
    }


@router.get("/admin/students", response_model=list[AdminProgressRow])
def admin_student_progress(db: Session = Depends(get_db)) -> list[AdminProgressRow]:
    stmt = (
        select(UserProgress, User, Lesson)
        .join(User, User.id == UserProgress.user_id)
        .join(Lesson, Lesson.id == UserProgress.lesson_id)
        .order_by(UserProgress.updated_at.desc())
        .limit(100)
    )
    rows = db.execute(stmt).all()
    return [
        AdminProgressRow(
            user_id=user.id,
            email=user.email,
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            opened=progress.opened,
            completed=progress.completed,
            quiz_completed=progress.quiz_completed,
            homework_submitted=progress.homework_submitted,
            updated_at=progress.updated_at.isoformat(),
        )
        for progress, user, lesson in rows
    ]


@router.post("/lesson")
def update_lesson_progress(request: ProgressUpdate, db: Session = Depends(get_db)) -> dict[str, str]:
    upsert_lesson_progress(
        db,
        user_id=request.user_id,
        lesson_id=request.lesson_id,
        opened=request.opened,
        completed=request.completed,
        quiz_completed=request.quiz_completed,
        homework_submitted=request.homework_submitted,
    )
    sync_user_gamification(db, request.user_id)
    db.commit()
    return {"status": "saved"}
