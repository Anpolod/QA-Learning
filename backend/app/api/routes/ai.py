from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user, _require_admin
from app.database.session import get_db
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
from app.services.ai_service import (
    chat_with_tutor,
    generate_image,
    get_ai_settings,
    get_ai_usage_summary,
    list_generated_images,
    list_generated_quizzes,
    list_generated_tasks,
    update_ai_settings,
)

router = APIRouter()


@router.post("/chat", response_model=AiChatResponse)
async def ai_chat(
    request: AiChatRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> AiChatResponse:
    user = _current_user(authorization, db)
    return await chat_with_tutor(db, request, user_id=user.id)


@router.post("/images/generate", response_model=AiImageGenerateResponse)
async def ai_image_generate(
    request: AiImageGenerateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> AiImageGenerateResponse:
    user = _current_user(authorization, db)
    return await generate_image(db, request, user_id=user.id, is_admin=user.role == "admin")


@router.get("/admin/settings", response_model=AiSettingsRead)
def ai_admin_settings(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> AiSettingsRead:
    _require_admin(authorization, db)
    return get_ai_settings(db)


@router.patch("/admin/settings", response_model=AiSettingsRead)
def ai_admin_settings_update(
    request: AiSettingsUpdate,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> AiSettingsRead:
    # Admin-only: this endpoint writes provider API keys.
    _require_admin(authorization, db)
    return update_ai_settings(db, request)


@router.get("/admin/usage", response_model=AiUsageSummary)
def ai_admin_usage(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> AiUsageSummary:
    _require_admin(authorization, db)
    return get_ai_usage_summary(db)


@router.get("/images", response_model=list[AiGeneratedImageRead])
def ai_images(limit: int = 12, db: Session = Depends(get_db)) -> list[AiGeneratedImageRead]:
    return list_generated_images(db, limit=limit)


@router.get("/generated/tasks", response_model=list[AiGeneratedTaskRead])
def ai_generated_tasks(limit: int = 20, db: Session = Depends(get_db)) -> list[AiGeneratedTaskRead]:
    return list_generated_tasks(db, limit=limit)


@router.get("/generated/quizzes", response_model=list[AiGeneratedQuizRead])
def ai_generated_quizzes(limit: int = 20, db: Session = Depends(get_db)) -> list[AiGeneratedQuizRead]:
    return list_generated_quizzes(db, limit=limit)
