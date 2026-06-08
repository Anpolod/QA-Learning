from typing import Literal

from pydantic import BaseModel, Field


AiMode = Literal["explain", "generate_task", "generate_quiz", "check_homework", "automation_help"]
ImageTargetType = Literal[
    "lesson_cover",
    "slide_image",
    "diagram",
    "workflow",
    "bug_example",
    "ui_mockup",
    "quiz_image",
    "homework_image",
    "interactive_task_image",
]
ImageStyle = Literal[
    "clean_educational",
    "modern_flat",
    "minimal_diagram",
    "isometric",
    "realistic_ui_mockup",
    "dark_tech",
    "friendly_learning",
]
ImageSize = Literal["1024x1024", "1024x1536", "1536x1024"]


class AiChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    lessonId: str
    mode: AiMode


class AiChatResponse(BaseModel):
    answer: str
    type: Literal["explanation", "task", "quiz", "feedback", "code_help"]


class AiImageGenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1200)
    lessonId: str
    targetType: ImageTargetType
    style: ImageStyle
    size: ImageSize


class AiImageGenerateResponse(BaseModel):
    imageUrl: str
    imageId: str
    prompt: str
    targetType: str
    style: str


class AiSettingsRead(BaseModel):
    provider: str
    textModel: str
    imageModel: str
    temperature: float
    maxTokens: int
    dailyTextLimitPerUser: int
    dailyImageLimitPerUser: int
    dailyImageLimitAdmin: int
    openaiConfigured: bool
    openrouterConfigured: bool


class AiSettingsUpdate(BaseModel):
    provider: Literal["openai", "openrouter"] | None = None
    textModel: str | None = Field(default=None, min_length=1, max_length=120)
    imageModel: str | None = Field(default=None, min_length=1, max_length=120)
    temperature: float | None = Field(default=None, ge=0, le=2)
    maxTokens: int | None = Field(default=None, ge=100, le=8000)
    dailyTextLimitPerUser: int | None = Field(default=None, ge=0, le=10000)
    dailyImageLimitPerUser: int | None = Field(default=None, ge=0, le=1000)
    dailyImageLimitAdmin: int | None = Field(default=None, ge=0, le=10000)


class AiUsageSummary(BaseModel):
    textRequestsToday: int
    imageRequestsToday: int
    totalRequestsToday: int
    dailyTextLimitPerUser: int
    dailyImageLimitAdmin: int


class AiGeneratedImageRead(BaseModel):
    id: int
    lessonId: int | None
    prompt: str
    enhancedPrompt: str
    imageUrl: str
    targetType: str
    style: str
    provider: str
    model: str
    createdAt: str


class AiGeneratedTaskRead(BaseModel):
    id: int
    lessonId: int
    userId: int
    content: str


class AiGeneratedQuizRead(BaseModel):
    id: int
    lessonId: int
    userId: int
    quizJson: str
