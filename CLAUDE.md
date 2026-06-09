# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Interactive learning platform for Manual QA, QA Automation, and AI for QA. Learning loop:
`Topic -> Theory -> Example -> Interactive Practice -> Homework -> Quiz -> Progress -> Final Project`.
Non-commercial educational/portfolio project. **All learner-facing UI text, course content, seed data, AI responses, and docs must be in English.**

Monorepo: `frontend/` (Next.js) + `backend/` (FastAPI) + `docs/`. Git root and the canonical `AGENTS.md`/`README.md` live in this directory (`qa-learning-platform/`), not the parent `QA Education/` folder.

## Commands

Full stack (Docker Compose, from repo root):
```bash
cp .env.example .env
docker compose up --build              # frontend :3000, backend :8000 (/docs, /health)
docker compose up -d db backend frontend
FRONTEND_HOST_PORT=3001 BACKEND_HOST_PORT=8000 docker compose up --build -d   # remap host ports
```

Seed / asset scripts (run inside backend container):
```bash
docker compose exec backend python -m app.seed.seed_data            # demo content (idempotent)
docker compose exec backend python -m app.seed.import_slide_assets  # attach generated slide images
# other one-off maintenance scripts live in backend/app/seed/ (enrich_*, audit_*, fill_*, fix_*)
```

Local backend / frontend:
```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && pnpm install && pnpm dev        # pnpm for frontend, pip for backend
```

Quality checks (there is no test suite — these are the gates):
```bash
python -m compileall backend/app                       # backend syntax
cd frontend && pnpm build                              # frontend build
cd frontend && pnpm lint                               # next lint
curl http://localhost:8000/health
```

Note: README/AGENTS mention Playwright e2e, but no `playwright.config` or `tests/` exists yet. Verify changes by running the affected route, not by running tests.

## Architecture (big picture)

**Backend** (`backend/app/`):
- `main.py` — creates the app, CORS, mounts `/uploads`, and **`Base.metadata.create_all(bind=engine)`**. There is **no Alembic**; schema changes happen by editing `models/entities.py` and recreating tables (drop the `postgres_data` volume to reset).
- `api/routes/` — routers: `courses`, `auth`, `quizzes`, `homework`, `progress`, `gamification`, `ai`, `glossary`. Each mounted at `/api/<name>`. **Lessons, modules, slides, examples, and admin CRUD do NOT have their own routers** — they live as `/admin/*` endpoints inside `courses.py` and `ai.py`. The **glossary** (`GET /api/glossary`) serves QA terms from the `glossary_terms` table (seeded via `app.seed.apply_glossary` from `seed/glossary.json`); the frontend `/glossary` page renders them and lesson "Key terms" link to `/glossary#<slug>` (slug derivation must match `apply_glossary.slugify`).
- `models/entities.py` — **all SQLAlchemy models in one file** (~340 lines), not split per the aspirational `docs/ARCHITECTURE.md`.
- `schemas/` — Pydantic schemas grouped by domain (`course`, `auth`, `quiz`, `homework`, `ai`, `gamification`).
- `services/` — business logic: `ai_service.py`, `gamification_service.py`, `progress_service.py`. Keep route handlers thin; put logic here.
- `database/session.py` — engine + session (`get_db`). Note: directory is `database/`, not `db/`.
- `ai/providers.py` — single-file provider abstraction (OpenAI + OpenRouter text, OpenAI GPT Image). Selected via `AI_PROVIDER` env.
- `auth/security.py` — password hashing + `create_access_token(subject, role)` (JWT, HS256).

**Auth / admin gating:** there is **no shared `get_current_user` FastAPI dependency**. `auth.py` decodes the raw `Authorization` header manually and `_require_admin(authorization, db)` enforces `role == "admin"` (403 otherwise). Admin endpoints call `_require_admin` explicitly. Roles: `student`, `admin` (token carries `sub` + `role`).

**Frontend** (`frontend/`, Next.js App Router):
- `app/` — routes: `dashboard`, `courses/[courseId]`, `lessons/[lessonId]`, `quiz/[lessonId]`, `homework/[lessonId]`, `admin`, `game`, `interview`, `final-projects`, `certificate`, `docs`, `profile`, `progress`, `about`, `pricing`, `login`, `register`.
- `lib/api.ts` — **single centralized typed API client. All backend calls go through here.** (Not a `lib/api/` package.) `features/` exists but is currently empty.
- `components/` — `admin`, `ai`, `course`. `types/` for shared TS types. Tailwind config in `tailwind.config.ts`.
- Env: `NEXT_PUBLIC_API_URL` (browser), `API_INTERNAL_URL=http://backend:8000` (server-side, in-cluster). Never put provider secrets in `NEXT_PUBLIC_*`.

## Hard rules

- **All AI/image calls go through backend `/api/ai/*`.** Frontend must never call OpenAI/OpenRouter directly. AI modes: `explain`, `generate_task`, `generate_quiz`, `check_homework`, `automation_help`. Usage is tracked in `AiUsageLog`; chats persist in `AiChatSession`/`AiChatMessage`. Homework mode guides/suggests — it must not just replace the student's answer.
- **Do not hardcode course content in React.** Render from backend/seed data.
- Keep API keys out of source and out of frontend env. `.env.example` holds placeholders only; `docker-compose.yml` loads `.env.example` as `env_file` for the backend — real keys go in a local `.env`.
- For upserts (progress), avoid duplicate rows. Avoid hard-deleting learning records referenced by progress/submissions.

## Deployment

GitHub Actions `.github/workflows/ci-cd.yml`. Push/PR to `main` runs checks; **push to `production` deploys** on a self-hosted VPS runner (`qa-learning-vps`) via `docker compose up --build -d`. Promote by `git checkout production && git merge main && git push origin production`. Live: frontend `:3001`, backend `:8000` on the VPS.
