"""API tests for auth, per-user progress isolation, and admin gating —
the behaviors hardened in the security pass.
"""

import uuid


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}@example.com"


def register_and_login(client, email: str, password: str = "pass1234") -> str:
    client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Test"})
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["accessToken"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_register_login_me(client):
    email = unique_email("me")
    token = register_and_login(client, email)
    resp = client.get("/api/auth/me", headers=_auth(token))
    assert resp.status_code == 200
    assert resp.json()["email"] == email


def test_progress_is_isolated_per_user(client, lesson_id):
    token_a = register_and_login(client, unique_email("iso-a"))
    token_b = register_and_login(client, unique_email("iso-b"))

    # User A opens a lesson.
    opened = client.post(
        "/api/progress/lesson", json={"lesson_id": lesson_id, "opened": True}, headers=_auth(token_a)
    )
    assert opened.status_code == 200

    dash_a = client.get("/api/progress/dashboard/me", headers=_auth(token_a)).json()
    dash_b = client.get("/api/progress/dashboard/me", headers=_auth(token_b)).json()

    assert dash_a["openedLessons"] >= 1
    assert dash_b["openedLessons"] == 0  # B is unaffected by A's activity


def test_progress_requires_auth(client, lesson_id):
    # No token -> rejected (not silently written to a default user).
    resp = client.post("/api/progress/lesson", json={"lesson_id": lesson_id, "opened": True})
    assert resp.status_code == 401
    assert client.get("/api/progress/dashboard/me").status_code == 401


def test_admin_endpoint_rejects_anonymous_and_student(client, student_token):
    body = {"course_id": 1, "title": "x", "order_index": 1}

    # Anonymous -> 401.
    assert client.post("/api/courses/admin/modules", json=body).status_code == 401

    # Student -> 403 (authenticated but not admin).
    assert client.post("/api/courses/admin/modules", json=body, headers=_auth(student_token)).status_code == 403


def test_admin_endpoint_allows_admin(client, admin_token):
    # Admin passes the auth gate (200 on success, or 404 if course 1 is absent — never 401/403).
    resp = client.post(
        "/api/courses/admin/modules",
        json={"course_id": 1, "title": "x", "order_index": 1},
        headers=_auth(admin_token),
    )
    assert resp.status_code in (200, 404)


def test_cross_user_dashboard_requires_admin(client, student_token):
    # Reading another user's dashboard by id is admin-only.
    assert client.get("/api/progress/dashboard/1").status_code == 401
    assert client.get("/api/progress/dashboard/1", headers=_auth(student_token)).status_code == 403
