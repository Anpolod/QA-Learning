# Agent Instructions

## Project Description

This repository is an interactive learning platform for QA Manual, QA Automation, and AI for QA. It teaches students through a structured learning loop:

Topic -> Theory -> Example -> Interactive Practice -> Homework -> Quiz -> Progress -> Final Project.

The product is built for beginner and job-ready QA students. All user interface text, course content, examples, quizzes, homework, AI assistant responses, prompts, seed data, and documentation intended for learners must be written in English.

## Tech Stack

- Frontend: Next.js, TypeScript, TailwindCSS, shadcn/ui-compatible component patterns.
- Backend: FastAPI, Pydantic, SQLAlchemy.
- Database: PostgreSQL.
- AI text providers: OpenAI API and OpenRouter API.
- AI image provider: OpenAI GPT Image through backend only.
- Testing: Playwright for end-to-end browser coverage.
- Deployment: Docker Compose.
- Package management: pnpm for frontend, pip/requirements for backend.

## Architecture Rules

- Keep the monorepo structure:
  - `frontend/` for Next.js app, UI components, types, and API client.
  - `backend/` for FastAPI routes, schemas, services, models, auth, database, and seed data.
  - `docs/` for project documentation.
- Keep frontend and backend concerns separate.
- Put backend business logic in services when it grows beyond simple route handlers.
- Keep API schemas typed with Pydantic.
- Keep frontend API calls centralized in `frontend/lib/api.ts`.
- Prefer extending existing components and route patterns over creating unrelated abstractions.
- Avoid hardcoding course content in React components. Use backend seed data or structured data.

## Code Style Rules

- Use TypeScript for frontend code.
- Use Python type hints for backend code.
- Keep names descriptive and domain-specific.
- Keep comments short and only where they clarify non-obvious logic.
- Prefer small, focused changes over broad rewrites.
- Use clear error states, loading states, and empty states.
- Keep all learner-facing text in English.

## Frontend Rules

- Use Next.js App Router pages under `frontend/app`.
- Use reusable components under `frontend/components`.
- Use TailwindCSS utility classes consistently.
- Use familiar controls:
  - buttons for commands
  - selects for option sets
  - checkboxes/toggles for binary values
  - textareas for long learner/admin content
  - progress bars/cards for progress
- Lesson pages should show:
  - lesson content
  - slides
  - examples
  - interactive practice
  - quiz/homework navigation
  - AI Assistant
- Admin pages should expose practical content management workflows, not only read-only summaries.
- Keep pages responsive and usable on mobile and desktop.

## Backend Rules

- Keep FastAPI routers under `backend/app/api/routes`.
- Keep SQLAlchemy models in `backend/app/models/entities.py`.
- Keep Pydantic schemas under `backend/app/schemas`.
- Keep database connection logic in `backend/app/database/session.py`.
- Keep auth utilities in `backend/app/auth`.
- Use HTTP errors with clear English messages.
- Do not expose internal secrets in API responses.
- Validate admin create/update requests before writing to the database.
- Preserve relational consistency when deleting records with dependent rows.

## AI Assistant Rules

- AI Assistant is a core feature, not optional.
- All AI requests must go through backend APIs.
- The frontend must never call OpenAI or OpenRouter directly.
- Supported modes:
  - `explain`
  - `generate_task`
  - `generate_quiz`
  - `check_homework`
  - `automation_help`
- The assistant must use current lesson context when available.
- For homework, the assistant should guide, explain, and suggest improvements instead of simply replacing the student's answer.
- For generated quizzes, prefer structured JSON that the frontend can render.
- Track usage in `AiUsageLog`.
- Persist chat sessions/messages in `AiChatSession` and `AiChatMessage`.
- Persist generated tasks/quizzes when using the relevant AI modes.

## GPT Image Generation Rules

- GPT Image generation must be available through backend APIs only.
- Never expose OpenAI API keys to the frontend.
- Image generation inputs must include:
  - prompt
  - lesson ID
  - target type
  - style
  - size
- The backend should enhance prompts with lesson/module context before calling the image provider.
- Generated images must be stored in a public uploads path for MVP.
- Image metadata must be saved in `AiGeneratedImage`.
- The admin UI should support previewing, regenerating, viewing history, and attaching images to course content.

## Security Rules

- Never commit real API keys, passwords, tokens, or secrets.
- Use `.env.example` with safe placeholder values only.
- API keys must be read from environment variables or safe backend-only configuration.
- Frontend environment variables must not contain provider secrets.
- JWT secret must be configurable through environment variables.
- Authenticated user data must not be trusted from frontend local storage alone.
- Validate all user-provided content before use.

## Database Rules

- Use PostgreSQL as the main database.
- Use SQLAlchemy models and Pydantic schemas.
- Keep seed data in English.
- Keep table relationships clear and delete dependencies intentionally.
- Use upsert logic for user progress to avoid duplicate progress rows.
- Keep AI usage logs separate from generated artifact records.

## Seed Data Rules

- Seed at least:
  - 3 Manual QA lessons
  - 3 QA Automation lessons
  - 3 AI for QA lessons
  - slides for each lesson
  - examples for each lesson
  - interactive tasks for each lesson
  - homework for each lesson
  - quizzes for each lesson
  - final projects for each course section
- Seed demo users with safe demo credentials only.
- Keep seed data idempotent where practical.
- Do not seed real personal information or real API keys.

## Testing Rules

- Use Playwright for browser flows.
- Prioritize end-to-end tests for:
  - course browsing
  - lesson view
  - quiz submit/retry
  - homework submit
  - AI Assistant open/send
  - admin content workflows
- Backend changes should pass Python syntax checks at minimum.
- Frontend changes should be verified by running the app route that was changed.
- Docker Compose should be used for full-stack verification when available.

## Commands

Run full stack with Docker Compose:

```bash
docker compose up --build
```

Run stack in background:

```bash
docker compose up -d db backend frontend
```

Seed demo data:

```bash
docker compose exec backend python -m app.seed.seed_data
```

Run backend locally:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run frontend locally:

```bash
cd frontend
pnpm install
pnpm dev
```

Run frontend build:

```bash
cd frontend
pnpm build
```

Check backend syntax:

```bash
python -m compileall backend/app
```

## Non-Negotiable Rules

- Do not expose API keys.
- Do not put real secrets in source code.
- Do not bypass backend for AI calls.
- Do not write learner-facing UI or course content in languages other than English.
- Do not replace database-backed learning content with hardcoded React-only content.
