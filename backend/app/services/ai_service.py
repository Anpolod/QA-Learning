from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.providers import OpenAIImageProvider, get_text_provider
from app.core.config import settings
from app.models.entities import (
    AiChatMessage,
    AiChatSession,
    AiGeneratedImage,
    AiGeneratedQuiz,
    AiGeneratedTask,
    AiSetting,
    AiUsageLog,
    Lesson,
    Module,
)
from app.schemas.ai import (
    AiChatRequest,
    AiChatResponse,
    AiGeneratedImageRead,
    AiGeneratedQuizRead,
    AiGeneratedTaskRead,
    AiImageGenerateRequest,
    AiImageGenerateResponse,
    AiSettingsRead,
    AiSettingsUpdate,
    AiUsageSummary,
)


ANSWER_TYPES = {
    "explain": "explanation",
    "generate_task": "task",
    "generate_quiz": "quiz",
    "check_homework": "feedback",
    "automation_help": "code_help",
}

SETTING_FIELDS = {
    "provider": "ai_provider",
    "textModel": "ai_model",
    "imageModel": "ai_image_model",
    "temperature": "ai_temperature",
    "maxTokens": "ai_max_tokens",
    "dailyTextLimitPerUser": "ai_daily_limit_per_user",
    "dailyImageLimitPerUser": "ai_daily_image_limit_per_user",
    "dailyImageLimitAdmin": "ai_daily_image_limit_admin",
}


def _coerce_setting(key: str, value: str) -> str | int | float:
    if key in {"temperature"}:
        return float(value)
    if key in {"maxTokens", "dailyTextLimitPerUser", "dailyImageLimitPerUser", "dailyImageLimitAdmin"}:
        return int(value)
    return value


def _effective_ai_settings(db: Session | None = None) -> dict[str, str | int | float | bool]:
    data: dict[str, str | int | float | bool] = {
        "provider": settings.ai_provider,
        "textModel": settings.ai_model,
        "imageModel": settings.ai_image_model,
        "temperature": settings.ai_temperature,
        "maxTokens": settings.ai_max_tokens,
        "dailyTextLimitPerUser": settings.ai_daily_limit_per_user,
        "dailyImageLimitPerUser": settings.ai_daily_image_limit_per_user,
        "dailyImageLimitAdmin": settings.ai_daily_image_limit_admin,
        "openaiConfigured": bool(settings.openai_api_key),
        "openrouterConfigured": bool(settings.openrouter_api_key),
    }
    if db:
        overrides = db.scalars(select(AiSetting)).all()
        for row in overrides:
            if row.key in SETTING_FIELDS:
                data[row.key] = _coerce_setting(row.key, row.value)
    return data


def _daily_count(db: Session, user_id: int, request_type: str) -> int:
    since = datetime.utcnow() - timedelta(days=1)
    stmt = select(func.count(AiUsageLog.id)).where(
        AiUsageLog.user_id == user_id,
        AiUsageLog.request_type == request_type,
        AiUsageLog.created_at >= since,
    )
    return int(db.scalar(stmt) or 0)


def _daily_total_count(db: Session, request_type: str) -> int:
    since = datetime.utcnow() - timedelta(days=1)
    stmt = select(func.count(AiUsageLog.id)).where(
        AiUsageLog.request_type == request_type,
        AiUsageLog.created_at >= since,
    )
    return int(db.scalar(stmt) or 0)


def get_ai_settings(db: Session | None = None) -> AiSettingsRead:
    effective = _effective_ai_settings(db)
    return AiSettingsRead(
        provider=str(effective["provider"]),
        textModel=str(effective["textModel"]),
        imageModel=str(effective["imageModel"]),
        temperature=float(effective["temperature"]),
        maxTokens=int(effective["maxTokens"]),
        dailyTextLimitPerUser=int(effective["dailyTextLimitPerUser"]),
        dailyImageLimitPerUser=int(effective["dailyImageLimitPerUser"]),
        dailyImageLimitAdmin=int(effective["dailyImageLimitAdmin"]),
        openaiConfigured=bool(effective["openaiConfigured"]),
        openrouterConfigured=bool(effective["openrouterConfigured"]),
    )


def update_ai_settings(db: Session, request: AiSettingsUpdate) -> AiSettingsRead:
    payload = request.model_dump(exclude_unset=True)
    for key, value in payload.items():
        if key not in SETTING_FIELDS or value is None:
            continue
        row = db.scalar(select(AiSetting).where(AiSetting.key == key))
        if row:
            row.value = str(value)
            row.updated_at = datetime.utcnow()
        else:
            db.add(AiSetting(key=key, value=str(value)))
    db.commit()
    return get_ai_settings(db)


def get_ai_usage_summary(db: Session) -> AiUsageSummary:
    effective = _effective_ai_settings(db)
    text_count = _daily_total_count(db, "text")
    image_count = _daily_total_count(db, "image")
    return AiUsageSummary(
        textRequestsToday=text_count,
        imageRequestsToday=image_count,
        totalRequestsToday=text_count + image_count,
        dailyTextLimitPerUser=int(effective["dailyTextLimitPerUser"]),
        dailyImageLimitAdmin=int(effective["dailyImageLimitAdmin"]),
    )


def list_generated_images(db: Session, limit: int = 12) -> list[AiGeneratedImageRead]:
    rows = db.scalars(select(AiGeneratedImage).order_by(AiGeneratedImage.created_at.desc()).limit(limit)).all()
    return [
        AiGeneratedImageRead(
            id=row.id,
            lessonId=row.lesson_id,
            prompt=row.prompt,
            enhancedPrompt=row.enhanced_prompt,
            imageUrl=row.image_url,
            targetType=row.target_type,
            style=row.style,
            provider=row.provider,
            model=row.model,
            createdAt=row.created_at.isoformat(),
        )
        for row in rows
    ]


def list_generated_tasks(db: Session, limit: int = 20) -> list[AiGeneratedTaskRead]:
    rows = db.scalars(select(AiGeneratedTask).order_by(AiGeneratedTask.id.desc()).limit(limit)).all()
    return [
        AiGeneratedTaskRead(id=row.id, lessonId=row.lesson_id, userId=row.user_id, content=row.content)
        for row in rows
    ]


def list_generated_quizzes(db: Session, limit: int = 20) -> list[AiGeneratedQuizRead]:
    rows = db.scalars(select(AiGeneratedQuiz).order_by(AiGeneratedQuiz.id.desc()).limit(limit)).all()
    return [
        AiGeneratedQuizRead(id=row.id, lessonId=row.lesson_id, userId=row.user_id, quizJson=row.quiz_json)
        for row in rows
    ]


def _lesson_context(db: Session, lesson_id: str) -> str:
    lesson = db.get(Lesson, int(lesson_id))
    if not lesson:
        return "No lesson context found."
    module = db.get(Module, lesson.module_id)
    return (
        f"Module: {module.title if module else 'Unknown'}\n"
        f"Lesson: {lesson.title}\n"
        f"Theory: {lesson.theory}\n"
        f"Example: {lesson.real_world_example}\n"
        f"Homework context: {lesson.practical_use_case}"
    )


async def chat_with_tutor(db: Session, request: AiChatRequest, user_id: int = 1) -> AiChatResponse:
    effective = _effective_ai_settings(db)
    if _daily_count(db, user_id, "text") >= int(effective["dailyTextLimitPerUser"]):
        raise HTTPException(status_code=429, detail="Daily AI text request limit reached.")

    session = AiChatSession(user_id=user_id, lesson_id=int(request.lessonId))
    db.add(session)
    db.flush()
    db.add(AiChatMessage(session_id=session.id, role="student", content=request.message))

    context = _lesson_context(db, request.lessonId)
    system_prompt = (
        "You are a friendly QA tutor. Explain in clear English for beginner and job-ready QA students. "
        "Use the current lesson context. For homework, guide and give hints before final answers. "
        "For generated quizzes, return structured JSON."
    )
    provider = get_text_provider(str(effective["provider"]))
    answer = await provider.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Lesson context:\n{context}\n\nMode: {request.mode}\nQuestion: {request.message}"},
        ],
        model=str(effective["textModel"]),
        temperature=float(effective["temperature"]),
        max_tokens=int(effective["maxTokens"]),
    )
    db.add(AiChatMessage(session_id=session.id, role="assistant", content=answer))
    if request.mode == "generate_task":
        db.add(AiGeneratedTask(lesson_id=int(request.lessonId), user_id=user_id, content=answer))
    if request.mode == "generate_quiz":
        db.add(AiGeneratedQuiz(lesson_id=int(request.lessonId), user_id=user_id, quiz_json=answer))
    db.add(
        AiUsageLog(
            user_id=user_id,
            lesson_id=int(request.lessonId),
            mode=request.mode,
            provider=str(effective["provider"]),
            model=str(effective["textModel"]),
            request_type="text",
        )
    )
    db.commit()
    return AiChatResponse(answer=answer, type=ANSWER_TYPES[request.mode])


def enhance_image_prompt(db: Session, request: AiImageGenerateRequest) -> str:
    lesson = db.get(Lesson, int(request.lessonId))
    module = db.get(Module, lesson.module_id) if lesson else None
    return (
        f"Create educational visual content for a QA learning platform. "
        f"Module: {module.title if module else 'Unknown module'}. "
        f"Lesson: {lesson.title if lesson else 'Unknown lesson'}. "
        f"Target type: {request.targetType}. Style: {request.style}. "
        f"Educational purpose: make the idea clear for beginner QA students. "
        f"User prompt: {request.prompt}. Use readable layout and avoid unnecessary decorative text."
    )


async def generate_image(db: Session, request: AiImageGenerateRequest, user_id: int = 1, is_admin: bool = True) -> AiImageGenerateResponse:
    effective = _effective_ai_settings(db)
    limit = int(effective["dailyImageLimitAdmin"] if is_admin else effective["dailyImageLimitPerUser"])
    if _daily_count(db, user_id, "image") >= limit:
        raise HTTPException(status_code=429, detail="Daily AI image generation limit reached.")

    enhanced_prompt = enhance_image_prompt(db, request)
    image_bytes = await OpenAIImageProvider().generate(enhanced_prompt, request.size, model=str(effective["imageModel"]))
    image_id = str(uuid4())
    output_dir = Path("uploads/ai-images")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{image_id}.png"
    output_path.write_bytes(image_bytes)
    image_url = f"/uploads/ai-images/{image_id}.png"

    db.add(
        AiUsageLog(
            user_id=user_id,
            lesson_id=int(request.lessonId),
            mode="image_generation",
            provider="openai",
            model=str(effective["imageModel"]),
            request_type="image",
        )
    )
    db.add(
        AiGeneratedImage(
            user_id=user_id,
            lesson_id=int(request.lessonId),
            prompt=request.prompt,
            enhanced_prompt=enhanced_prompt,
            image_url=image_url,
            target_type=request.targetType,
            style=request.style,
            provider="openai",
            model=str(effective["imageModel"]),
        )
    )
    db.commit()
    return AiImageGenerateResponse(
        imageUrl=image_url,
        imageId=image_id,
        prompt=request.prompt,
        targetType=request.targetType,
        style=request.style,
    )
