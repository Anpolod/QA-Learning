from pydantic import BaseModel


class HomeworkRead(BaseModel):
    id: int
    lesson_id: int
    task_description: str
    expected_result: str
    allow_file_upload: bool

    model_config = {"from_attributes": True}


class HomeworkSubmissionRead(BaseModel):
    id: int
    homework_id: int
    user_id: int
    answer_text: str
    file_url: str
    status: str
    created_at: str


class HomeworkReviewRequest(BaseModel):
    status: str


class HomeworkCreateRequest(BaseModel):
    lesson_id: int
    task_description: str
    expected_result: str
    allow_file_upload: bool = True


class HomeworkUpdateRequest(BaseModel):
    task_description: str | None = None
    expected_result: str | None = None
    allow_file_upload: bool | None = None
