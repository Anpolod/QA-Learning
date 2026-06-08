from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserRead(BaseModel):
    id: int
    email: str
    role: str
    fullName: str = ""
    goal: str = ""


class AdminUserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    fullName: str = Field(default="", max_length=255)
    goal: str = Field(default="Become a job-ready QA engineer", max_length=255)
    role: str = Field(default="student", pattern="^(student|admin)$")


class AdminUserUpdateRequest(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    fullName: str | None = Field(default=None, max_length=255)
    goal: str | None = Field(default=None, max_length=255)
    role: str | None = Field(default=None, pattern="^(student|admin)$")


class ProfileUpdateRequest(BaseModel):
    fullName: str = Field(default="", max_length=255)
    goal: str = Field(default="", max_length=255)


class AuthResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserRead
