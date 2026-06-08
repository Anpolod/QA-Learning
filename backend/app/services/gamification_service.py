from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.entities import (
    Achievement,
    AiUsageLog,
    FinalProjectSubmission,
    Lesson,
    QuizAttempt,
    User,
    UserAchievement,
    UserGameStats,
    UserProgress,
    XpLog,
)


ACHIEVEMENT_DEFINITIONS = [
    {
        "code": "first_step",
        "title": "First Step",
        "description": "Open your first QA lesson.",
        "icon": "sparkles",
        "category": "learning",
        "xp_reward": 25,
    },
    {
        "code": "lesson_finisher_5",
        "title": "Lesson Finisher",
        "description": "Complete 5 lessons.",
        "icon": "check",
        "category": "learning",
        "xp_reward": 50,
    },
    {
        "code": "manual_pathfinder",
        "title": "Manual QA Pathfinder",
        "description": "Complete 15 lessons and build a strong manual QA base.",
        "icon": "map",
        "category": "learning",
        "xp_reward": 100,
    },
    {
        "code": "quiz_sprinter",
        "title": "Quiz Sprinter",
        "description": "Finish 5 quizzes.",
        "icon": "target",
        "category": "quiz",
        "xp_reward": 75,
    },
    {
        "code": "homework_hero",
        "title": "Homework Hero",
        "description": "Submit 5 homework tasks.",
        "icon": "clipboard",
        "category": "practice",
        "xp_reward": 75,
    },
    {
        "code": "automation_climber",
        "title": "Automation Climber",
        "description": "Complete 30 lessons and move into serious QA automation practice.",
        "icon": "code",
        "category": "automation",
        "xp_reward": 150,
    },
    {
        "code": "ai_qa_explorer",
        "title": "AI QA Explorer",
        "description": "Use the AI assistant at least 10 times.",
        "icon": "brain",
        "category": "ai",
        "xp_reward": 100,
    },
    {
        "code": "project_shipper",
        "title": "Project Shipper",
        "description": "Submit a final project.",
        "icon": "rocket",
        "category": "project",
        "xp_reward": 150,
    },
    {
        "code": "qa_champion",
        "title": "QA Champion",
        "description": "Complete 60 lessons.",
        "icon": "crown",
        "category": "mastery",
        "xp_reward": 250,
    },
]


RANKS = [
    (0, "QA Rookie"),
    (250, "Bug Hunter"),
    (700, "Test Analyst"),
    (1400, "Automation Explorer"),
    (2400, "QA Engineer"),
    (3800, "Senior QA"),
    (5500, "QA Champion"),
]


def seed_achievements(db: Session) -> None:
    for item in ACHIEVEMENT_DEFINITIONS:
        statement = (
            insert(Achievement)
            .values(**item)
            .on_conflict_do_update(
                index_elements=["code"],
                set_={
                    "title": item["title"],
                    "description": item["description"],
                    "icon": item["icon"],
                    "category": item["category"],
                    "xp_reward": item["xp_reward"],
                },
            )
        )
        db.execute(statement)


def rank_for_xp(xp: int) -> str:
    rank = RANKS[0][1]
    for threshold, title in RANKS:
        if xp >= threshold:
            rank = title
    return rank


def level_for_xp(xp: int) -> int:
    return max(1, xp // 250 + 1)


def next_rank_threshold(xp: int) -> int | None:
    for threshold, _ in RANKS:
        if threshold > xp:
            return threshold
    return None


def calculate_streak_days(progress_rows: list[UserProgress]) -> int:
    days = {row.updated_at.date() for row in progress_rows if row.updated_at}
    if not days:
        return 0
    today = datetime.utcnow().date()
    streak = 0
    cursor = today
    if cursor not in days and (cursor - timedelta(days=1)) in days:
        cursor = cursor - timedelta(days=1)
    while cursor in days:
        streak += 1
        cursor = cursor - timedelta(days=1)
    return streak


def achievement_codes_for_stats(
    *,
    opened_lessons: int,
    completed_lessons: int,
    quiz_completed: int,
    homework_submitted: int,
    ai_usage_total: int,
    final_projects_submitted: int,
) -> set[str]:
    codes: set[str] = set()
    if opened_lessons >= 1:
        codes.add("first_step")
    if completed_lessons >= 5:
        codes.add("lesson_finisher_5")
    if completed_lessons >= 15:
        codes.add("manual_pathfinder")
    if quiz_completed >= 5:
        codes.add("quiz_sprinter")
    if homework_submitted >= 5:
        codes.add("homework_hero")
    if completed_lessons >= 30:
        codes.add("automation_climber")
    if ai_usage_total >= 10:
        codes.add("ai_qa_explorer")
    if final_projects_submitted >= 1:
        codes.add("project_shipper")
    if completed_lessons >= 60:
        codes.add("qa_champion")
    return codes


def sync_user_gamification(db: Session, user_id: int) -> UserGameStats:
    seed_achievements(db)
    progress_rows = db.scalars(select(UserProgress).where(UserProgress.user_id == user_id)).all()
    opened_lessons = sum(1 for row in progress_rows if row.opened)
    completed_lessons = sum(1 for row in progress_rows if row.completed)
    quiz_completed = sum(1 for row in progress_rows if row.quiz_completed)
    homework_submitted = sum(1 for row in progress_rows if row.homework_submitted)
    quiz_attempts = int(db.scalar(select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == user_id)) or 0)
    ai_usage_total = int(db.scalar(select(func.count(AiUsageLog.id)).where(AiUsageLog.user_id == user_id)) or 0)
    final_projects_submitted = int(
        db.scalar(select(func.count(FinalProjectSubmission.id)).where(FinalProjectSubmission.user_id == user_id)) or 0
    )
    total_lessons = int(db.scalar(select(func.count(Lesson.id))) or 0)

    unlocked_codes = achievement_codes_for_stats(
        opened_lessons=opened_lessons,
        completed_lessons=completed_lessons,
        quiz_completed=quiz_completed,
        homework_submitted=homework_submitted,
        ai_usage_total=ai_usage_total,
        final_projects_submitted=final_projects_submitted,
    )
    achievements = db.scalars(select(Achievement)).all()
    achievements_by_code = {achievement.code: achievement for achievement in achievements}
    existing = {
        row.achievement_id
        for row in db.scalars(select(UserAchievement).where(UserAchievement.user_id == user_id)).all()
    }

    achievement_xp = 0
    for code in unlocked_codes:
        achievement = achievements_by_code.get(code)
        if achievement is None:
            continue
        achievement_xp += achievement.xp_reward
        if achievement.id not in existing:
            db.add(UserAchievement(user_id=user_id, achievement_id=achievement.id))

    xp = (
        opened_lessons * 5
        + completed_lessons * 25
        + quiz_completed * 20
        + homework_submitted * 35
        + quiz_attempts * 5
        + final_projects_submitted * 150
        + achievement_xp
    )

    stats = db.scalar(select(UserGameStats).where(UserGameStats.user_id == user_id))
    if stats is None:
        stats = UserGameStats(user_id=user_id)
        db.add(stats)
    stats.xp = xp
    stats.level = level_for_xp(xp)
    stats.rank = rank_for_xp(xp)
    stats.streak_days = calculate_streak_days(progress_rows)
    stats.last_activity_at = max((row.updated_at for row in progress_rows), default=datetime.utcnow())
    stats.updated_at = datetime.utcnow()

    db.flush()
    return stats


def record_xp_log_once(db: Session, *, user_id: int, source: str, source_id: int | None, points: int, description: str) -> None:
    existing = db.scalar(
        select(XpLog).where(XpLog.user_id == user_id, XpLog.source == source, XpLog.source_id == source_id)
    )
    if existing:
        return
    db.add(XpLog(user_id=user_id, source=source, source_id=source_id, points=points, description=description))
