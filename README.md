# QA Learning Platform

QA Learning Platform is a non-commercial educational project created by Andrii Polodiienko for learning, practice, and portfolio development.

The goal of the project is to help students practice manual QA, QA automation thinking, AI-assisted QA workflows, documentation, test design, bug reporting, and release readiness in one practical product.

The learning flow is:

```text
Topic -> Theory -> Example -> Interactive Practice -> Homework -> Quiz -> Progress -> Final Project
```

## Project Status

This project is built for education and practice. It is not a commercial SaaS product and is not intended to process real customer data.

## Features

- Student registration and login.
- Protected student dashboard.
- Course catalog with modules and lessons.
- Lesson pages with theory, examples, slides, practical tasks, homework, quizzes, and AI assistant.
- QA documentation page with requirements and QA deliverables:
  - Requirements analysis
  - Test plan
  - Test strategy
  - Test scenarios
  - Test cases
  - Checklists
  - Traceability matrix
  - Bug reports
  - Test summary report
- Mock interview practice page.
- Gamification with XP, levels, ranks, achievements, and leaderboard.
- Final project submissions and certificate readiness.
- Admin panel protected by login.
- Admin user management: create, edit, and delete users.
- Admin content management for modules, lessons, slides, examples, tasks, homework, quizzes, AI settings, generated images, and reviews.
- AI assistant and AI image generation through backend-only provider calls.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Backend: FastAPI, Pydantic, SQLAlchemy.
- Database: PostgreSQL.
- Auth: JWT bearer tokens.
- AI providers: OpenAI and OpenRouter.
- Deployment: Docker Compose.
- CI/CD: GitHub Actions with a self-hosted VPS runner and deployment from the `production` branch.

## Project Structure

```text
qa-learning-platform/
  backend/
    app/
      ai/
      api/
      auth/
      core/
      database/
      models/
      schemas/
      seed/
      services/
    Dockerfile
    requirements.txt
  frontend/
    app/
    components/
    features/
    lib/
    types/
    Dockerfile
    package.json
  docs/
  scripts/
  docker-compose.yml
  README.md
  .env.example
```

## Local Run With Docker

Copy the environment example:

```bash
cp .env.example .env
```

Start the full stack:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- Backend API docs: http://localhost:8000/docs

Host ports can be changed without editing compose:

```bash
FRONTEND_HOST_PORT=3001 BACKEND_HOST_PORT=8000 docker compose up --build -d
```

## Local Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## Local Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

Backend:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/qa_learning
JWT_SECRET=change_me
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENROUTER_API_KEY=
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=1200
AI_DAILY_LIMIT_PER_USER=50
AI_IMAGE_MODEL=gpt-image-1
AI_DAILY_IMAGE_LIMIT_PER_USER=10
AI_DAILY_IMAGE_LIMIT_ADMIN=100
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_INTERNAL_URL=http://backend:8000
```

Never commit real API keys, passwords, tokens, or production secrets.

## Seed Data

Seed demo content:

```bash
docker compose exec backend python -m app.seed.seed_data
```

Seed ISTQB CTFL content and text slides:

```bash
docker compose exec backend python -m app.seed.create_istqb_course
docker compose exec backend python -m app.seed.apply_lesson_content
docker compose exec backend python -m app.seed.add_istqb_slides
```

Import generated slide assets:

```bash
docker compose exec backend python -m app.seed.import_slide_assets
```

## Quality Checks

Frontend build:

```bash
docker compose run --rm frontend pnpm build
```

Backend syntax check:

```bash
docker compose exec backend python -m compileall app
```

Health check:

```bash
curl http://localhost:8000/health
```

## CI/CD

GitHub Actions workflow is stored in:

```text
.github/workflows/ci-cd.yml
```

Workflow behavior:

- Push or pull request to `main`: run backend and frontend checks.
- Push or pull request to `production`: run checks.
- Push to `production`: run deployment on the VPS self-hosted runner with Docker Compose.

Production runner:

```text
runner name: qa-learning-vps
runner labels: self-hosted, Linux, X64, production, vps
```

Production deployment is branch-based:

```bash
git checkout production
git merge main
git push origin production
```

On deployment, GitHub checks out the `production` branch on the VPS runner and runs:

```bash
docker compose up --build -d
```

Current VPS production ports:

- Frontend: http://89.167.105.129:3001
- Backend API: http://89.167.105.129:8000

No private VPS SSH key is stored in GitHub Secrets for this deployment flow.

## License

Non-commercial educational project. Created for learning and QA practice.
