from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import ai, auth, courses, gamification, glossary, homework, progress, quizzes
from app.core.config import settings
from app.database.session import Base, engine

Path("uploads/ai-images").mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

# Disable the built-in docs pages so we can serve Swagger UI / ReDoc from self-hosted
# assets instead of cdn.jsdelivr.net, which is unreliable on some networks (the embedded
# /api-testing explorer needs them to load anywhere).
app = FastAPI(title="QA Learning Platform API", version="0.1.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def cookie_to_auth_header(request: Request, call_next):
    # Let the httpOnly access_token cookie act as the bearer token: if there is no
    # Authorization header, inject one from the cookie so existing auth code works.
    has_auth = any(key == b"authorization" for key, _ in request.scope["headers"])
    if not has_auth:
        token = request.cookies.get("access_token")
        if token:
            request.scope["headers"] = request.scope["headers"] + [
                (b"authorization", f"Bearer {token}".encode())
            ]
    return await call_next(request)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# Served under /api/* so the reverse proxy routes them to the backend, leaving the
# frontend /docs route free for the project-documentation page.
@app.get("/api/docs", include_in_schema=False)
def custom_swagger_ui() -> object:
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        swagger_js_url="/static/swagger/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger/swagger-ui.css",
    )


@app.get("/api/redoc", include_in_schema=False)
def custom_redoc() -> object:
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - ReDoc",
        redoc_js_url="/static/swagger/redoc.standalone.js",
    )

app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(homework.router, prefix="/api/homework", tags=["homework"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(glossary.router, prefix="/api/glossary", tags=["glossary"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
