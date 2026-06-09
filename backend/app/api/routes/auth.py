from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, hash_password, verify_password
from app.core.config import settings
from app.database.session import get_db
from app.models.entities import (
    AiChatMessage,
    AiChatSession,
    AiGeneratedImage,
    AiGeneratedQuiz,
    AiGeneratedTask,
    AiHomeworkFeedback,
    AiUsageLog,
    FinalProjectSubmission,
    HomeworkSubmission,
    QuizAttempt,
    User,
    UserAchievement,
    UserGameStats,
    UserProfile,
    UserProgress,
    XpLog,
)
from app.schemas.auth import (
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    AuthResponse,
    LoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    UserRead,
)

router = APIRouter()

COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = 12 * 3600  # match the JWT lifetime


def _set_auth_cookie(response: Response, token: str) -> None:
    # httpOnly so JS (and XSS) cannot read the token; the backend reads it via
    # a middleware that injects it as the Authorization header.
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


def _auth_response(user: User, profile: UserProfile | None = None, response: Response | None = None) -> AuthResponse:
    token = create_access_token(str(user.id), user.role)
    if response is not None:
        _set_auth_cookie(response, token)
    return AuthResponse(
        accessToken=token,
        user=UserRead(
            id=user.id,
            email=user.email,
            role=user.role,
            fullName=profile.full_name if profile else "",
            goal=profile.goal if profile else "",
        ),
    )


def _current_user(authorization: str, db: Session) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.") from exc
    user_id = int(payload["sub"])
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def _require_admin(authorization: str, db: Session) -> User:
    user = _current_user(authorization, db)
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role is required.")
    return user


def _user_read(user: User, profile: UserProfile | None = None) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        role=user.role,
        fullName=profile.full_name if profile else "",
        goal=profile.goal if profile else "",
    )


def _delete_user_related_rows(db: Session, user_id: int) -> None:
    submission_ids = db.scalars(select(HomeworkSubmission.id).where(HomeworkSubmission.user_id == user_id)).all()
    if submission_ids:
        db.execute(delete(AiHomeworkFeedback).where(AiHomeworkFeedback.submission_id.in_(submission_ids)))

    session_ids = db.scalars(select(AiChatSession.id).where(AiChatSession.user_id == user_id)).all()
    if session_ids:
        db.execute(delete(AiChatMessage).where(AiChatMessage.session_id.in_(session_ids)))

    for model in (
        UserProfile,
        UserGameStats,
        UserAchievement,
        XpLog,
        HomeworkSubmission,
        QuizAttempt,
        UserProgress,
        FinalProjectSubmission,
        AiChatSession,
        AiGeneratedTask,
        AiGeneratedQuiz,
        AiUsageLog,
        AiGeneratedImage,
    ):
        db.execute(delete(model).where(model.user_id == user_id))


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.scalar(select(User).where(User.email == request.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
    user = User(email=request.email.lower(), password_hash=hash_password(request.password), role="student")
    db.add(user)
    db.flush()
    profile = UserProfile(user_id=user.id, full_name=request.full_name)
    db.add(profile)
    db.commit()
    db.refresh(user)
    return _auth_response(user, profile, response)


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == request.email.lower()))
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    return _auth_response(user, profile, response)


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"status": "logged_out"}


@router.get("/me", response_model=UserRead)
def me(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> UserRead:
    user = _current_user(authorization, db)
    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    return _user_read(user, profile)


@router.patch("/profile", response_model=UserRead)
def update_profile(
    request: ProfileUpdateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> UserRead:
    user = _current_user(authorization, db)
    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
    profile.full_name = request.fullName
    profile.goal = request.goal or "Become a job-ready QA engineer"
    db.commit()
    db.refresh(profile)
    return UserRead(id=user.id, email=user.email, role=user.role, fullName=profile.full_name, goal=profile.goal)


@router.get("/admin/users", response_model=list[UserRead])
def admin_users(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> list[UserRead]:
    _require_admin(authorization, db)
    rows = (
        db.execute(select(User, UserProfile).outerjoin(UserProfile, UserProfile.user_id == User.id).order_by(User.created_at.desc()))
        .all()
    )
    return [_user_read(user, profile) for user, profile in rows]


@router.post("/admin/users", response_model=UserRead)
def admin_create_user(
    request: AdminUserCreateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> UserRead:
    _require_admin(authorization, db)
    email = request.email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
    user = User(email=email, password_hash=hash_password(request.password), role=request.role)
    db.add(user)
    db.flush()
    profile = UserProfile(user_id=user.id, full_name=request.fullName, goal=request.goal or "Become a job-ready QA engineer")
    db.add(profile)
    db.commit()
    db.refresh(user)
    return _user_read(user, profile)


@router.patch("/admin/users/{user_id}", response_model=UserRead)
def admin_update_user(
    user_id: int,
    request: AdminUserUpdateRequest,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> UserRead:
    _require_admin(authorization, db)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if request.email is not None:
        email = request.email.lower()
        existing = db.scalar(select(User).where(User.email == email, User.id != user.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
        user.email = email
    if request.password:
        user.password_hash = hash_password(request.password)
    if request.role is not None:
        user.role = request.role

    profile = db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
    if request.fullName is not None:
        profile.full_name = request.fullName
    if request.goal is not None:
        profile.goal = request.goal or "Become a job-ready QA engineer"

    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return _user_read(user, profile)


@router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> dict[str, int | str]:
    current_user = _require_admin(authorization, db)
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete their own account.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    _delete_user_related_rows(db, user.id)
    db.delete(user)
    db.commit()
    return {"status": "deleted", "userId": user_id}
