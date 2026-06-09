from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session, selectinload

from app.api.routes.auth import _current_user
from app.database.session import get_db
from app.models.entities import (
    AiChatSession,
    AiGeneratedImage,
    AiGeneratedQuiz,
    AiGeneratedTask,
    AiUsageLog,
    Course,
    FinalProject,
    FinalProjectSubmission,
    Homework,
    HomeworkSubmission,
    Lesson,
    LessonExample,
    LessonInteractiveTask,
    LessonSlide,
    Module,
    Quiz,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
    UserProgress,
)
from app.schemas.course import (
    CourseRead,
    ExampleCreateRequest,
    ExampleRead,
    ExampleUpdateRequest,
    FinalProjectRead,
    FinalProjectReviewRequest,
    FinalProjectSubmissionRead,
    FinalProjectSubmitRequest,
    InteractiveTaskCreateRequest,
    InteractiveTaskRead,
    InteractiveTaskUpdateRequest,
    LessonCreateRequest,
    LessonRead,
    LessonUpdateRequest,
    ModuleCreateRequest,
    ModuleRead,
    ModuleUpdateRequest,
    SlideCreateRequest,
    SlideRead,
    SlideUpdateRequest,
)

router = APIRouter()


def _delete_lesson_with_dependencies(db: Session, lesson_id: int) -> None:
    homework_ids = list(db.scalars(select(Homework.id).where(Homework.lesson_id == lesson_id)).all())
    quiz_ids = list(db.scalars(select(Quiz.id).where(Quiz.lesson_id == lesson_id)).all())
    question_ids = list(db.scalars(select(QuizQuestion.id).where(QuizQuestion.quiz_id.in_(quiz_ids))).all()) if quiz_ids else []

    if homework_ids:
        db.execute(delete(HomeworkSubmission).where(HomeworkSubmission.homework_id.in_(homework_ids)))
        db.execute(delete(Homework).where(Homework.id.in_(homework_ids)))
    if question_ids:
        db.execute(delete(QuizAnswer).where(QuizAnswer.question_id.in_(question_ids)))
        db.execute(delete(QuizQuestion).where(QuizQuestion.id.in_(question_ids)))
    if quiz_ids:
        db.execute(delete(QuizAttempt).where(QuizAttempt.quiz_id.in_(quiz_ids)))
        db.execute(delete(Quiz).where(Quiz.id.in_(quiz_ids)))

    db.execute(delete(UserProgress).where(UserProgress.lesson_id == lesson_id))
    db.execute(delete(AiGeneratedTask).where(AiGeneratedTask.lesson_id == lesson_id))
    db.execute(delete(AiGeneratedQuiz).where(AiGeneratedQuiz.lesson_id == lesson_id))
    db.execute(update(AiUsageLog).where(AiUsageLog.lesson_id == lesson_id).values(lesson_id=None))
    db.execute(update(AiGeneratedImage).where(AiGeneratedImage.lesson_id == lesson_id).values(lesson_id=None))
    db.execute(update(AiChatSession).where(AiChatSession.lesson_id == lesson_id).values(lesson_id=None))


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)) -> list[Course]:
    lesson_load = selectinload(Course.modules).selectinload(Module.lessons)
    stmt = select(Course).options(
        lesson_load.selectinload(Lesson.slides),
        lesson_load.selectinload(Lesson.examples),
        lesson_load.selectinload(Lesson.interactive_tasks),
    )
    return list(db.scalars(stmt).all())


@router.get("/final-projects", response_model=list[FinalProjectRead])
def list_final_projects(db: Session = Depends(get_db)) -> list[FinalProject]:
    stmt = select(FinalProject).order_by(FinalProject.id)
    return list(db.scalars(stmt).all())


def _final_project_submission_read(submission: FinalProjectSubmission) -> FinalProjectSubmissionRead:
    return FinalProjectSubmissionRead(
        id=submission.id,
        final_project_id=submission.final_project_id,
        user_id=submission.user_id,
        submission_text=submission.submission_text,
        file_url=submission.file_url,
        status=submission.status,
        created_at=submission.created_at.isoformat(),
    )


@router.get("/final-projects/submissions", response_model=list[FinalProjectSubmissionRead])
def list_final_project_submissions(db: Session = Depends(get_db)) -> list[FinalProjectSubmissionRead]:
    rows = db.scalars(select(FinalProjectSubmission).order_by(FinalProjectSubmission.created_at.desc()).limit(50)).all()
    return [_final_project_submission_read(row) for row in rows]


@router.post("/final-projects/{project_id}/submit", response_model=FinalProjectSubmissionRead)
def submit_final_project(
    project_id: int,
    request: FinalProjectSubmitRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> FinalProjectSubmissionRead:
    user = _current_user(authorization, db)
    project = db.get(FinalProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Final project not found")
    submission = FinalProjectSubmission(
        final_project_id=project_id,
        user_id=user.id,
        submission_text=request.submission_text,
        file_url=request.file_url,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return _final_project_submission_read(submission)


@router.patch("/final-projects/submissions/{submission_id}/review", response_model=FinalProjectSubmissionRead)
def review_final_project_submission(
    submission_id: int,
    request: FinalProjectReviewRequest,
    db: Session = Depends(get_db),
) -> FinalProjectSubmissionRead:
    if request.status not in {"approved", "needs_changes", "submitted"}:
        raise HTTPException(status_code=422, detail="Invalid final project review status.")
    submission = db.get(FinalProjectSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Final project submission not found")
    submission.status = request.status
    db.commit()
    db.refresh(submission)
    return _final_project_submission_read(submission)


@router.post("/admin/modules", response_model=ModuleRead)
def create_module(request: ModuleCreateRequest, db: Session = Depends(get_db)) -> Module:
    course = db.get(Course, request.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    module = Module(
        course_id=request.course_id,
        title=request.title,
        description=request.description or "New module draft.",
        order_index=request.order_index,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.patch("/admin/modules/{module_id}", response_model=ModuleRead)
def update_module(module_id: int, request: ModuleUpdateRequest, db: Session = Depends(get_db)) -> Module:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(module, field, value)
    db.commit()
    db.refresh(module)
    return module


@router.delete("/admin/modules/{module_id}")
def delete_module(module_id: int, db: Session = Depends(get_db)) -> dict[str, str | int]:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lesson_ids = list(db.scalars(select(Lesson.id).where(Lesson.module_id == module_id)).all())
    for lesson_id in lesson_ids:
        _delete_lesson_with_dependencies(db, lesson_id)
    db.delete(module)
    db.commit()
    return {"status": "deleted", "moduleId": module_id}


@router.post("/admin/lessons", response_model=LessonRead)
def create_lesson(request: LessonCreateRequest, db: Session = Depends(get_db)) -> Lesson:
    module = db.get(Module, request.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lesson = Lesson(
        module_id=request.module_id,
        title=request.title,
        short_description=request.short_description or "New lesson draft.",
        learning_goals="Define clear learning goals for this lesson.",
        theory=request.theory or "Add the full theory explanation for this lesson.",
        key_terms="Add key terms.",
        real_world_example="Add a real-world QA example.",
        step_by_step="Add step-by-step explanation.",
        common_mistakes="Add common mistakes.",
        practical_use_case="Add a practical use case.",
        summary="Add a concise lesson summary.",
        order_index=request.order_index,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.patch("/admin/lessons/{lesson_id}", response_model=LessonRead)
def update_lesson(lesson_id: int, request: LessonUpdateRequest, db: Session = Depends(get_db)) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/admin/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)) -> dict[str, str | int]:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    _delete_lesson_with_dependencies(db, lesson_id)
    db.delete(lesson)
    db.commit()
    return {"status": "deleted", "lessonId": lesson_id}


@router.post("/admin/slides", response_model=SlideRead)
def create_slide(request: SlideCreateRequest, db: Session = Depends(get_db)) -> LessonSlide:
    lesson = db.get(Lesson, request.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    slide = LessonSlide(
        lesson_id=request.lesson_id,
        title=request.title,
        body=request.body,
        order_index=request.order_index,
        image_url=request.image_url,
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


@router.patch("/admin/slides/{slide_id}", response_model=SlideRead)
def update_slide(slide_id: int, request: SlideUpdateRequest, db: Session = Depends(get_db)) -> LessonSlide:
    slide = db.get(LessonSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(slide, field, value)
    db.commit()
    db.refresh(slide)
    return slide


@router.post("/admin/examples", response_model=ExampleRead)
def create_example(request: ExampleCreateRequest, db: Session = Depends(get_db)) -> LessonExample:
    lesson = db.get(Lesson, request.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    example = LessonExample(lesson_id=request.lesson_id, title=request.title, content=request.content)
    db.add(example)
    db.commit()
    db.refresh(example)
    return example


@router.patch("/admin/examples/{example_id}", response_model=ExampleRead)
def update_example(example_id: int, request: ExampleUpdateRequest, db: Session = Depends(get_db)) -> LessonExample:
    example = db.get(LessonExample, example_id)
    if not example:
        raise HTTPException(status_code=404, detail="Example not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(example, field, value)
    db.commit()
    db.refresh(example)
    return example


@router.post("/admin/interactive-tasks", response_model=InteractiveTaskRead)
def create_interactive_task(request: InteractiveTaskCreateRequest, db: Session = Depends(get_db)) -> LessonInteractiveTask:
    lesson = db.get(Lesson, request.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    task = LessonInteractiveTask(
        lesson_id=request.lesson_id,
        task_type=request.task_type,
        prompt=request.prompt,
        expected_answer=request.expected_answer,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/admin/interactive-tasks/{task_id}", response_model=InteractiveTaskRead)
def update_interactive_task(
    task_id: int,
    request: InteractiveTaskUpdateRequest,
    db: Session = Depends(get_db),
) -> LessonInteractiveTask:
    task = db.get(LessonInteractiveTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Interactive task not found")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    lesson_load = selectinload(Course.modules).selectinload(Module.lessons)
    stmt = (
        select(Course)
        .where(Course.id == course_id)
        .options(
            lesson_load.selectinload(Lesson.slides),
            lesson_load.selectinload(Lesson.examples),
            lesson_load.selectinload(Lesson.interactive_tasks),
        )
    )
    course = db.scalar(stmt)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/modules/{module_id}", response_model=ModuleRead)
def get_module(module_id: int, db: Session = Depends(get_db)) -> Module:
    lesson_load = selectinload(Module.lessons)
    stmt = (
        select(Module)
        .where(Module.id == module_id)
        .options(
            lesson_load.selectinload(Lesson.slides),
            lesson_load.selectinload(Lesson.examples),
            lesson_load.selectinload(Lesson.interactive_tasks),
        )
    )
    module = db.scalar(stmt)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.get("/lessons/{lesson_id}", response_model=LessonRead)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Lesson:
    stmt = (
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(selectinload(Lesson.slides), selectinload(Lesson.examples), selectinload(Lesson.interactive_tasks))
    )
    lesson = db.scalar(stmt)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
