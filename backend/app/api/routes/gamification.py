from fastapi import APIRouter, Depends, Header
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user, _require_admin
from app.database.session import get_db
from app.models.entities import Achievement, Lesson, User, UserAchievement, UserGameStats, UserProfile, UserProgress
from app.schemas.gamification import AchievementRead, LeaderboardRow, PlayerStatsRead, RankRead
from app.services.gamification_service import RANKS, next_rank_threshold, seed_achievements, sync_user_gamification

router = APIRouter()


def _next_rank_title(xp: int) -> str | None:
    for threshold, title in RANKS:
        if threshold > xp:
            return title
    return None


def _player_payload(user_id: int, db: Session) -> PlayerStatsRead:
    user = db.get(User, user_id)
    if user is None:
        user = db.scalar(select(User).order_by(User.id))
    if user is None:
        user = User(email="demo@example.com", password_hash="demo", role="student")
        db.add(user)
        db.flush()

    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    stats = sync_user_gamification(db, user.id)
    db.commit()
    db.refresh(stats)

    progress_rows = db.scalars(select(UserProgress).where(UserProgress.user_id == user.id)).all()
    completed_lessons = sum(1 for row in progress_rows if row.completed)
    opened_lessons = sum(1 for row in progress_rows if row.opened)
    quiz_completed = sum(1 for row in progress_rows if row.quiz_completed)
    homework_submitted = sum(1 for row in progress_rows if row.homework_submitted)
    total_lessons = int(db.scalar(select(func.count(Lesson.id))) or 0)
    unlocked_rows = db.scalars(select(UserAchievement).where(UserAchievement.user_id == user.id)).all()
    unlocked_by_achievement_id = {row.achievement_id: row for row in unlocked_rows}
    achievements = db.scalars(select(Achievement).order_by(Achievement.id)).all()
    next_threshold = next_rank_threshold(stats.xp)

    return PlayerStatsRead(
        userId=user.id,
        email=user.email,
        fullName=profile.full_name if profile else "",
        goal=profile.goal if profile else "Become a job-ready QA engineer",
        xp=stats.xp,
        level=stats.level,
        rank=stats.rank,
        nextRank=_next_rank_title(stats.xp),
        nextRankXp=next_threshold,
        xpToNextRank=max(next_threshold - stats.xp, 0) if next_threshold is not None else None,
        streakDays=stats.streak_days,
        completedLessons=completed_lessons,
        openedLessons=opened_lessons,
        quizCompleted=quiz_completed,
        homeworkSubmitted=homework_submitted,
        totalLessons=total_lessons,
        completionPercent=round((completed_lessons / total_lessons) * 100, 1) if total_lessons else 0,
        achievementsUnlocked=len(unlocked_rows),
        achievementsTotal=len(achievements),
        ranks=[RankRead(title=title, threshold=threshold, reached=stats.xp >= threshold) for threshold, title in RANKS],
        achievements=[
            AchievementRead(
                id=achievement.id,
                code=achievement.code,
                title=achievement.title,
                description=achievement.description,
                icon=achievement.icon,
                category=achievement.category,
                xpReward=achievement.xp_reward,
                unlocked=achievement.id in unlocked_by_achievement_id,
                unlockedAt=unlocked_by_achievement_id[achievement.id].unlocked_at
                if achievement.id in unlocked_by_achievement_id
                else None,
            )
            for achievement in achievements
        ],
    )


@router.get("/player/me", response_model=PlayerStatsRead)
def player_stats_me(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> PlayerStatsRead:
    user = _current_user(authorization, db)
    seed_achievements(db)
    db.commit()
    return _player_payload(user.id, db)


@router.get("/player/{user_id}", response_model=PlayerStatsRead)
def player_stats(user_id: int, authorization: str = Header(default=""), db: Session = Depends(get_db)) -> PlayerStatsRead:
    _require_admin(authorization, db)
    seed_achievements(db)
    db.commit()
    return _player_payload(user_id, db)


@router.post("/sync/{user_id}", response_model=PlayerStatsRead)
def sync_player_stats(user_id: int, authorization: str = Header(default=""), db: Session = Depends(get_db)) -> PlayerStatsRead:
    _require_admin(authorization, db)
    return _player_payload(user_id, db)


@router.get("/leaderboard", response_model=list[LeaderboardRow])
def leaderboard(db: Session = Depends(get_db)) -> list[LeaderboardRow]:
    # Public, read-only: stats are synced when users act (dashboard/player/progress
    # endpoints), not here — an anonymous page view must not write to the DB.
    rows = (
        db.execute(
            select(User, UserProfile, UserGameStats)
            .join(UserGameStats, UserGameStats.user_id == User.id)
            .outerjoin(UserProfile, UserProfile.user_id == User.id)
            .order_by(UserGameStats.xp.desc(), UserGameStats.level.desc(), User.id.asc())
        )
        .all()
    )
    achievements_by_user = dict(
        db.execute(
            select(UserAchievement.user_id, func.count(UserAchievement.id)).group_by(UserAchievement.user_id)
        ).all()
    )
    completed_by_user = dict(
        db.execute(
            select(UserProgress.user_id, func.count(UserProgress.id))
            .where(UserProgress.completed == True)
            .group_by(UserProgress.user_id)
        ).all()
    )
    result: list[LeaderboardRow] = []
    for index, (user, profile, stats) in enumerate(rows, start=1):
        full_name = profile.full_name if profile else ""
        # Never expose raw emails on a public endpoint; fall back to a masked handle.
        display_name = full_name or f"{user.email.split('@')[0][:2]}***"
        result.append(
            LeaderboardRow(
                position=index,
                userId=user.id,
                displayName=display_name,
                xp=stats.xp,
                level=stats.level,
                rank=stats.rank,
                achievementsUnlocked=int(achievements_by_user.get(user.id, 0)),
                completedLessons=int(completed_by_user.get(user.id, 0)),
            )
        )
    return result
