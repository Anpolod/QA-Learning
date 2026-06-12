# Architecture

This document describes the technical architecture of the QA Learning Platform.

## Monorepo Structure

```text
qa-learning-platform/
  frontend/
  backend/
  docs/
  docker-compose.yml
  .env.example
  README.md
  AGENTS.md
```

The repository keeps frontend, backend, documentation, and deployment configuration together so Codex and human developers can reason about full-stack changes.

## Frontend Structure

```text
frontend/
  app/
    admin/
    courses/
    dashboard/
    final-projects/
    homework/
    lessons/
    login/
    progress/
    quiz/
    register/
  components/
    admin/
    ai/
    course/
  lib/
    api.ts
  types/
    course.ts
  styles/
```

Rules:

- Pages live in `frontend/app`.
- Reusable UI lives in `frontend/components`.
- API calls live in `frontend/lib/api.ts`.
- Shared frontend types live in `frontend/types`.
- Student-facing pages must remain in English.
- Admin workflows should be feature-complete enough for real content editing.

## Backend Structure

```text
backend/
  app/
    ai/
      providers.py
    api/
      routes/
    auth/
    core/
      config.py
    database/
      session.py
    models/
      entities.py
    schemas/
    seed/
      seed_data.py
    services/
```

Rules:

- FastAPI app starts from `backend/app/main.py`.
- Routes are grouped by domain.
- Pydantic schemas are grouped by domain.
- SQLAlchemy models are centralized in `models/entities.py`.
- AI provider abstraction lives under `app/ai`.
- Business logic should move to services when it becomes more than simple CRUD.

## Database Structure

Main model groups:

### User Models

- `User`
- `UserProfile`
- `UserProgress`

### Course Models

- `Course`
- `Module`
- `Lesson`
- `LessonSlide`
- `LessonExample`
- `LessonInteractiveTask`
- `Homework`
- `HomeworkSubmission`
- `Quiz`
- `QuizQuestion`
- `QuizAnswer`
- `QuizAttempt`
- `FinalProject`
- `FinalProjectSubmission`

### AI Models

- `AiChatSession`
- `AiChatMessage`
- `AiGeneratedTask`
- `AiGeneratedQuiz`
- `AiHomeworkFeedback`
- `AiUsageLog`
- `AiSetting`
- `AiGeneratedImage`

## AI Provider Abstraction

Text providers:

- `OpenAIProvider`
- `OpenRouterProvider`

Image provider:

- `OpenAIImageProvider`

Rules:

- Frontend never calls providers directly.
- Backend chooses provider based on safe settings.
- API keys are environment-only.
- Runtime AI settings may override non-secret values such as provider, model, limits, temperature, and token limits.

## API Structure

Base API URL:

```text
http://localhost:8000
```

Main route groups:

```text
/api/auth
/api/courses
/api/quizzes
/api/homework
/api/progress
/api/ai
```

Examples:

```http
POST /api/auth/login
GET /api/courses
GET /api/courses/lessons/{lesson_id}
POST /api/quizzes/{quiz_id}/submit
POST /api/homework/{homework_id}/submit
GET /api/progress/dashboard/{user_id}
POST /api/ai/chat
POST /api/ai/images/generate
```

## Auth Structure

Current auth:

- email/password registration
- email/password login
- JWT access token
- `/api/auth/me`
- editable profile fields

Frontend stores demo token in local storage for MVP flows.

Security rules:

- Do not trust local storage for authorization decisions.
- Backend must validate JWT.
- API keys must never be sent to frontend.
- Production should add role checks for admin endpoints.

## Admin Panel Structure

Admin workspace includes:

- AI settings
- AI usage
- module manager
- lesson manager
- quiz manager
- slide manager
- example manager
- interactive practice manager
- AI image generator
- homework manager
- homework review
- final project review
- student progress
- generated image history

Admin components live under:

```text
frontend/components/admin/
```

## Deployment Structure

Docker Compose services:

- `db`: PostgreSQL
- `backend`: FastAPI
- `frontend`: Next.js

Typical command:

```bash
docker compose up --build
```

Backend port:

```text
8000
```

Frontend port:

```text
3000
```

## Data Flow Examples

### Lesson Page

1. Frontend calls `GET /api/courses/lessons/{lesson_id}`.
2. Backend returns lesson, slides, examples, and interactive tasks.
3. Frontend renders lesson content.
4. `LessonProgressTracker` marks lesson opened.
5. AI Assistant uses lesson ID for contextual help.

### Quiz Submit

1. Frontend loads quiz by lesson.
2. Student selects answers.
3. Frontend posts answer IDs.
4. Backend calculates score.
5. Backend saves `QuizAttempt`.
6. Backend updates `UserProgress`.
7. Frontend shows score and wrong answer explanations.

### AI Image Generation

1. Admin enters prompt.
2. Frontend posts prompt metadata to backend.
3. Backend enhances prompt.
4. Backend calls GPT Image.
5. Backend saves file and metadata.
6. Frontend previews image and can attach it to slide content.
