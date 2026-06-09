from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.api.routes.auth import _current_user
from app.database.session import get_db
from app.schemas.testdocs import (
    AttemptRead,
    GenerateScenarioRequest,
    ReviewRequest,
    ReviewResponse,
    ScenarioRead,
)
from app.services import testdocs_service

router = APIRouter()


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
