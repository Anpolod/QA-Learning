# Deployment notes

Production runs on a VPS (`qa.flow-ai.work`) via a GitHub Actions self-hosted
runner. Pushing to `production` runs `docker compose up --build -d`.

## Reverse proxy (nginx)

The site config lives at [`nginx/qa.flow-ai.work.conf`](nginx/qa.flow-ai.work.conf)
and mirrors `/etc/nginx/sites-available/qa` on the VPS. It must route
`/api`, `/uploads`, `/static`, `/health`, and `/openapi.json` to the backend
(`:8000`); everything else goes to the frontend (`:3001`). If the nginx config is
ever recreated, copy this file back and reload (see the header in the .conf).

## Backend secrets (`.env`)

`docker-compose.yml` loads the backend env from `.env` (gitignored). It is **not**
in the repo. On the VPS it lives in the deploy workspace with a strong
`JWT_SECRET` (perms 600). To bootstrap a new environment:

```bash
cp .env.example .env
# set a strong JWT_SECRET (e.g. python -c "import secrets;print(secrets.token_hex(32))")
# provider API keys can be set here or in Admin -> AI settings (stored in DB)
```

Never commit `.env`. `.env.example` holds placeholders only.

## Database migrations (Alembic)

Schema is now tracked with Alembic (`backend/migrations/`, baseline
`5b29e73e567b`). `app/main.py` still runs `create_all` for a fresh DB, but
schema CHANGES go through migrations (create_all never alters existing tables).

One-time adoption on a database that already has the schema (created via
create_all) — mark the baseline as applied without re-running it:

```bash
cd backend && DATABASE_URL=... alembic stamp head
```

Workflow for a model change:

```bash
cd backend
alembic revision --autogenerate -m "describe change"   # review the generated file
alembic upgrade head                                    # apply locally
# commit the migration; apply on prod with: docker compose exec backend alembic upgrade head
```

Run `alembic check` to confirm models and migrations are in sync (CI-friendly).

## Backend Swagger / ReDoc

Served from self-hosted assets (no CDN) at `/api/docs` and `/api/redoc`
(`backend/app/static/swagger/`). The frontend `/docs` route is the Project Docs
viewer, not Swagger.
