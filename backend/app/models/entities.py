from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class CourseSection(str, Enum):
    manual = "manual"
    automation = "automation"
    ai_for_qa = "ai_for_qa"


class UserRole(str, Enum):
    student = "student"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default=UserRole.student.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    full_name: Mapped[str] = mapped_column(String(255), default="")
    goal: Mapped[str] = mapped_column(String(255), default="Become a job-ready QA engineer")


class UserGameStats(Base):
    __tablename__ = "user_game_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    rank: Mapped[str] = mapped_column(String(80), default="QA Rookie")
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    icon: Mapped[str] = mapped_column(String(80), default="trophy")
    category: Mapped[str] = mapped_column(String(80), default="learning")
    xp_reward: Mapped[int] = mapped_column(Integer, default=25)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"))
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class XpLog(Base):
    __tablename__ = "xp_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    source: Mapped[str] = mapped_column(String(120))
    source_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    points: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    section: Mapped[str] = mapped_column(String(50), unique=True)
    description: Mapped[str] = mapped_column(Text)
    modules: Mapped[list["Module"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    course: Mapped[Course] = relationship(back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"))
    title: Mapped[str] = mapped_column(String(255))
    short_description: Mapped[str] = mapped_column(Text)
    learning_goals: Mapped[str] = mapped_column(Text)
    theory: Mapped[str] = mapped_column(Text)
    key_terms: Mapped[str] = mapped_column(Text)
    real_world_example: Mapped[str] = mapped_column(Text)
    step_by_step: Mapped[str] = mapped_column(Text)
    common_mistakes: Mapped[str] = mapped_column(Text)
    practical_use_case: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    module: Mapped[Module] = relationship(back_populates="lessons")
    slides: Mapped[list["LessonSlide"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    examples: Mapped[list["LessonExample"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    interactive_tasks: Mapped[list["LessonInteractiveTask"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")


class LessonSlide(Base):
    __tablename__ = "lesson_slides"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    lesson: Mapped[Lesson] = relationship(back_populates="slides")


class LessonExample(Base):
    __tablename__ = "lesson_examples"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    lesson: Mapped[Lesson] = relationship(back_populates="examples")


class LessonInteractiveTask(Base):
    __tablename__ = "lesson_interactive_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    task_type: Mapped[str] = mapped_column(String(80))
    prompt: Mapped[str] = mapped_column(Text)
    expected_answer: Mapped[str] = mapped_column(Text)
    lesson: Mapped[Lesson] = relationship(back_populates="interactive_tasks")


class Homework(Base):
    __tablename__ = "homework"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), unique=True)
    task_description: Mapped[str] = mapped_column(Text)
    expected_result: Mapped[str] = mapped_column(Text)
    allow_file_upload: Mapped[bool] = mapped_column(Boolean, default=True)


class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    homework_id: Mapped[int] = mapped_column(ForeignKey("homework.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    answer_text: Mapped[str] = mapped_column(Text)
    file_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(40), default="submitted")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), unique=True)
    title: Mapped[str] = mapped_column(String(255))


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"))
    question: Mapped[str] = mapped_column(Text)
    question_type: Mapped[str] = mapped_column(String(40))
    explanation: Mapped[str] = mapped_column(Text)


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("quiz_questions.id"))
    answer_text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    score: Mapped[int] = mapped_column(Integer)
    total_questions: Mapped[int] = mapped_column(Integer)
    answers_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserProgress(Base):
    __tablename__ = "user_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    opened: Mapped[bool] = mapped_column(Boolean, default=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    quiz_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    homework_submitted: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FinalProject(Base):
    __tablename__ = "final_projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(255))
    requirements: Mapped[str] = mapped_column(Text)


class FinalProjectSubmission(Base):
    __tablename__ = "final_project_submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    final_project_id: Mapped[int] = mapped_column(ForeignKey("final_projects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    submission_text: Mapped[str] = mapped_column(Text)
    file_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(40), default="submitted")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AiChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[int | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AiChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("ai_chat_sessions.id"))
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AiGeneratedTask(Base):
    __tablename__ = "ai_generated_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)


class AiGeneratedQuiz(Base):
    __tablename__ = "ai_generated_quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    quiz_json: Mapped[str] = mapped_column(Text)


class AiHomeworkFeedback(Base):
    __tablename__ = "ai_homework_feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("homework_submissions.id"))
    feedback: Mapped[str] = mapped_column(Text)


class AiUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[int | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    mode: Mapped[str] = mapped_column(String(80))
    provider: Mapped[str] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(120))
    request_type: Mapped[str] = mapped_column(String(40), default="text")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AiSetting(Base):
    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AiGeneratedImage(Base):
    __tablename__ = "ai_generated_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[int | None] = mapped_column(ForeignKey("lessons.id"), nullable=True)
    prompt: Mapped[str] = mapped_column(Text)
    enhanced_prompt: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(500))
    target_type: Mapped[str] = mapped_column(String(80))
    style: Mapped[str] = mapped_column(String(80))
    provider: Mapped[str] = mapped_column(String(80), default="openai")
    model: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
