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


# --- Glossary -------------------------------------------------------------

def test_glossary_is_public_and_returns_list(client):
    resp = client.get("/api/glossary")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_glossary_returns_seeded_term(client, db):
    from app.models.entities import GlossaryTerm

    slug = f"test-term-{uuid.uuid4().hex[:8]}"
    db.add(GlossaryTerm(slug=slug, term="Test Term", definition="A term for testing.", category="Fundamentals"))
    db.commit()

    slugs = {t["slug"] for t in client.get("/api/glossary").json()}
    assert slug in slugs


# --- Test Documentation practice -----------------------------------------

def _seed_scenario(db, doc_type="bug_report"):
    from app.models.entities import DocScenario

    scenario = DocScenario(
        doc_type=doc_type,
        title=f"Scenario {uuid.uuid4().hex[:6]}",
        brief="Write a bug report for X.",
        context="Some context.",
        source="seed",
    )
    db.add(scenario)
    db.commit()
    return scenario.id


def test_testdocs_scenarios_requires_auth(client):
    assert client.get("/api/test-docs/scenarios?type=test_case").status_code == 401


def test_testdocs_invalid_type_rejected(client, student_token, db):
    _seed_scenario(db)
    resp = client.get("/api/test-docs/scenarios?type=bogus", headers=_auth(student_token))
    assert resp.status_code == 400


def test_testdocs_scenarios_lists_seeded(client, student_token, db):
    sid = _seed_scenario(db, "bug_report")
    resp = client.get("/api/test-docs/scenarios?type=bug_report", headers=_auth(student_token))
    assert resp.status_code == 200
    assert sid in {s["id"] for s in resp.json()}


def test_testdocs_review_requires_auth(client):
    resp = client.post(
        "/api/test-docs/review",
        json={"scenario_id": 1, "doc_type": "bug_report", "fields": {"title": "x"}},
    )
    assert resp.status_code == 401


def test_testdocs_attempts_empty_for_new_user(client):
    token = register_and_login(client, unique_email("docs"))
    resp = client.get("/api/test-docs/attempts", headers=_auth(token))
    assert resp.status_code == 200
    assert resp.json() == []
