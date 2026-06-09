"""Pytest fixtures. Requires a Postgres test DB (the app uses Postgres-only
upserts). Set DATABASE_URL before importing the app; CI provides a postgres
service. Locally: point DATABASE_URL at a throwaway database.
"""

import os
import uuid

os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/qa_test")
os.environ.setdefault("JWT_SECRET", "test-secret")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.auth.security import hash_password
from app.database.session import SessionLocal
from app.models.entities import Course, Lesson, Module, User

EMPTY_TEXT = {
    "short_description": "",
    "learning_goals": "",
    "theory": "",
    "key_terms": "",
    "real_world_example": "",
    "step_by_step": "",
    "common_mistakes": "",
    "practical_use_case": "",
    "summary": "",
}


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}@example.com"


def register_and_login(client, email: str, password: str = "pass1234") -> str:
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Test"})
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture
def student_token(client):
    return register_and_login(client, unique_email("student"))


@pytest.fixture
def admin_token(client, db):
    email = unique_email("admin")
    admin = User(email=email, password_hash=hash_password("adminpass"), role="admin")
    db.add(admin)
    db.commit()
    resp = client.post("/api/auth/login", json={"email": email, "password": "adminpass"})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


@pytest.fixture
def lesson_id(db):
    course = Course(title="Test course", section=f"test-{uuid.uuid4().hex[:8]}", description="d")
    db.add(course)
    db.flush()
    module = Module(course_id=course.id, title="Test module", description="d", order_index=1)
    db.add(module)
    db.flush()
    lesson = Lesson(module_id=module.id, title=f"Test lesson {uuid.uuid4().hex[:6]}", order_index=1, **EMPTY_TEXT)
    db.add(lesson)
    db.commit()
    return lesson.id
