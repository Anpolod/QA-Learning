from datetime import datetime

from pydantic import BaseModel


class AchievementRead(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    category: str
    xpReward: int
    unlocked: bool = False
    unlockedAt: datetime | None = None


class RankRead(BaseModel):
    title: str
    threshold: int
    reached: bool


class PlayerStatsRead(BaseModel):
    userId: int
    email: str
    fullName: str
    goal: str
    xp: int
    level: int
    rank: str
    nextRank: str | None
    nextRankXp: int | None
    xpToNextRank: int | None
    streakDays: int
    completedLessons: int
    openedLessons: int
    quizCompleted: int
    homeworkSubmitted: int
    totalLessons: int
    completionPercent: float
    achievementsUnlocked: int
    achievementsTotal: int
    ranks: list[RankRead]
    achievements: list[AchievementRead]


class LeaderboardRow(BaseModel):
    position: int
    userId: int
    email: str
    fullName: str
    xp: int
    level: int
    rank: str
    achievementsUnlocked: int
    completedLessons: int
