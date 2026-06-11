from datetime import datetime

from pydantic import BaseModel


class ScenarioRead(BaseModel):
    id: int
    doc_type: str
    title: str
    brief: str
    context: str
    source: str


class GenerateScenarioRequest(BaseModel):
    doc_type: str  # validated against testdocs_service.EXPECTED_FIELDS keys


class ReviewRequest(BaseModel):
    scenario_id: int
    doc_type: str
    fields: dict[str, str]


class FieldFeedback(BaseModel):
    name: str
    rating: str  # good | weak | missing
    comment: str


class ReviewResponse(BaseModel):
    attempt_id: int
    score: int
    summary: str
    fields: list[FieldFeedback]
    improvements: list[str]


class AttemptRead(BaseModel):
    id: int
    scenario_id: int
    scenario_title: str
    doc_type: str
    score: int
    summary: str
    created_at: datetime


class AttemptDetail(BaseModel):
    id: int
    doc_type: str
    scenario_title: str
    scenario_brief: str
    score: int
    fields: dict[str, str]
    feedback: dict
    created_at: datetime
