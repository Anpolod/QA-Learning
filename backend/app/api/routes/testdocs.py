from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user
from app.database.session import get_db
from app.schemas.testdocs import (
    AttemptDetail,
    AttemptRead,
    GenerateScenarioRequest,
    ReviewRequest,
    ReviewResponse,
    ScenarioRead,
)
from app.services import testdocs_service

router = APIRouter()

MAX_SCREENSHOT_BYTES = 1_000_000  # 1 MB
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif"}


@router.get("/scenarios", response_model=list[ScenarioRead])
def scenarios(
    type: str,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> list[ScenarioRead]:
    _current_user(authorization, db)
    return testdocs_service.list_scenarios(db, type)


@router.post("/generate", response_model=ScenarioRead)
async def generate(
    request: GenerateScenarioRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> ScenarioRead:
    user = _current_user(authorization, db)
    return await testdocs_service.generate_scenario(db, request.doc_type, user.id)


@router.post("/review", response_model=ReviewResponse)
async def review(
    request: ReviewRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    user = _current_user(authorization, db)
    attempt, feedback = await testdocs_service.review_submission(
        db, user.id, request.scenario_id, request.doc_type, request.fields
    )
    return ReviewResponse(attempt_id=attempt.id, **feedback)


@router.get("/attempts", response_model=list[AttemptRead])
def attempts(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> list[AttemptRead]:
    user = _current_user(authorization, db)
    return testdocs_service.list_attempts(db, user.id)


@router.get("/attempts/{attempt_id}", response_model=AttemptDetail)
def attempt_detail(
    attempt_id: int,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> AttemptDetail:
    user = _current_user(authorization, db)
    return AttemptDetail(**testdocs_service.get_attempt(db, user.id, attempt_id))


@router.post("/upload")
async def upload_screenshot(
    file: UploadFile = File(...),
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> dict:
    _current_user(authorization, db)
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, WebP or GIF images are allowed.")
    data = await file.read()
    if len(data) > MAX_SCREENSHOT_BYTES:
        raise HTTPException(status_code=413, detail="Screenshot must be 1 MB or smaller.")
    return {"url": testdocs_service.save_screenshot(data, file.content_type)}
