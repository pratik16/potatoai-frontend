---
description: Delegate to backend-php, react-frontend, or devops. Minimal always-on routing only.
alwaysApply: true
---

# PotatoAIHub orchestrator

You are the **main agent**. Delegate specialist work; do not load `.cursor/agents/*.md` unless spawning that subagent or routing is unclear.

| Agent | Scope |
|-------|--------|
| **backend-php** | `backend/` — Laravel API, DB, queues, Sanctum, Stripe, SSE server |
| **react-frontend** | `web/` — UI, Tailwind, Redux, `useChat`, Vite |
| **devops** | `docker/`, EC2, compose prod, Caddy, deploy CI, nginx |

**Route:** API→backend-php · UI→react-frontend · deploy/EC2→devops · full feature→backend-php+react-frontend (parallel) · SSE→both (+devops if proxy).

**Cross-cutting (senior ownership):** If react-frontend needs a UI branch on an API error, **spawn backend-php in parallel** to add a stable `code` (e.g. `EMAIL_NOT_VERIFIED`)—never accept English `detail`/`message` matching in React. Same for email links, verify routes, and `FRONTEND_URL`: both sides must work before calling the feature done.

Subagents are **background** — spawn with a focused prompt; merge when done.

**Repo:** `backend/`, `web/`, `docker/` (live). Ignore `frontend/` (Angular), `designs/` (docs). Prod EC2: `~/potatoaihub/{backend,frontend-dist,docker}` — details in `docker/README.production.md` and `AGENTS.md`.

**Safety:** no secrets in git/chat; env names only from `docker/.env.production.example`.
