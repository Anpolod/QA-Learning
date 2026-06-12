from pydantic import BaseModel


class QuizSubmitRequest(BaseModel):
    user_id: int | None = None  # ignored; attributed to the authenticated user
    answers: dict[int, list[int]]


class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    wrong_answers: list[dict[str, str]]


class QuizAnswerCreate(BaseModel):
    answer_text: str
    is_correct: bool = False


class QuizQuestionCreateRequest(BaseModel):
    lesson_id: int
    question: str
    question_type: str = "single"
    explanation: str
    answers: list[QuizAnswerCreate]


class QuizQuestionCreateResponse(BaseModel):
    quiz_id: int
    question_id: int
    answer_ids: list[int]


class QuizQuestionUpdateRequest(BaseModel):
    question: str | None = None
    question_type: str | None = None
    explanation: str | None = None
    answers: list[QuizAnswerCreate] | None = None


class QuizQuestionRead(BaseModel):
    id: int
    question: str
    question_type: str
    explanation: str
    answer_ids: list[int] = []
