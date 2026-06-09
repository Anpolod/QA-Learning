from pydantic import BaseModel


class SlideRead(BaseModel):
    id: int
    title: str
    body: str
    order_index: int
    image_url: str

    model_config = {"from_attributes": True}


class SlideCreateRequest(BaseModel):
    lesson_id: int
    title: str
    body: str
    order_index: int = 0
    image_url: str = ""


class SlideUpdateRequest(BaseModel):
    title: str | None = None
    body: str | None = None
    order_index: int | None = None
    image_url: str | None = None


class ExampleRead(BaseModel):
    id: int
    title: str
    content: str

    model_config = {"from_attributes": True}


class ExampleCreateRequest(BaseModel):
    lesson_id: int
    title: str
    content: str


class ExampleUpdateRequest(BaseModel):
    title: str | None = None
    content: str | None = None


class InteractiveTaskRead(BaseModel):
    id: int
    task_type: str
    prompt: str
    expected_answer: str

    model_config = {"from_attributes": True}


class InteractiveTaskCreateRequest(BaseModel):
    lesson_id: int
    task_type: str = "analysis"
    prompt: str
    expected_answer: str


class InteractiveTaskUpdateRequest(BaseModel):
    task_type: str | None = None
    prompt: str | None = None
    expected_answer: str | None = None


class LessonRead(BaseModel):
    id: int
    title: str
    short_description: str
    learning_goals: str
    theory: str
    key_terms: str
    real_world_example: str
    step_by_step: str
    common_mistakes: str
    practical_use_case: str
    summary: str
    order_index: int
    slides: list[SlideRead] = []
    examples: list[ExampleRead] = []
    interactive_tasks: list[InteractiveTaskRead] = []

    model_config = {"from_attributes": True}


class LessonCreateRequest(BaseModel):
    module_id: int
    title: str
    short_description: str = ""
    theory: str = ""
    order_index: int = 0


class LessonUpdateRequest(BaseModel):
    title: str | None = None
    short_description: str | None = None
    learning_goals: str | None = None
    theory: str | None = None
    key_terms: str | None = None
    real_world_example: str | None = None
    step_by_step: str | None = None
    common_mistakes: str | None = None
    practical_use_case: str | None = None
    summary: str | None = None
    order_index: int | None = None


class ModuleRead(BaseModel):
    id: int
    title: str
    description: str
    order_index: int
    lessons: list[LessonRead] = []

    model_config = {"from_attributes": True}


class ModuleCreateRequest(BaseModel):
    course_id: int
    title: str
    description: str = ""
    order_index: int = 0


class ModuleUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    order_index: int | None = None


class CourseRead(BaseModel):
    id: int
    title: str
    section: str
    description: str
    modules: list[ModuleRead] = []

    model_config = {"from_attributes": True}


class FinalProjectRead(BaseModel):
    id: int
    course_id: int
    title: str
    requirements: str

    model_config = {"from_attributes": True}


class FinalProjectSubmitRequest(BaseModel):
    user_id: int | None = None  # ignored; attributed to the authenticated user
    submission_text: str
    file_url: str = ""


class FinalProjectReviewRequest(BaseModel):
    status: str


class FinalProjectSubmissionRead(BaseModel):
    id: int
    final_project_id: int
    user_id: int
    submission_text: str
    file_url: str
    status: str
    created_at: str
