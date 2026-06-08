from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import ai, auth, courses, gamification, homework, progress, quizzes
from app.core.config import settings
from app.database.session import Base, engine

Path("uploads/ai-images").mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QA Learning Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])
app.include_router(homework.router, prefix="/api/homework", tags=["homework"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
