# Reporeaver - GitHub Portfolio Intel

[![backend-ci](https://github.com/arthurpviegas/reporeaver/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/backend-ci.yml)
[![frontend-ci](https://github.com/arthurpviegas/reporeaver/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/frontend-ci.yml)
[![infra-plan](https://github.com/arthurpviegas/reporeaver/actions/workflows/infra-plan.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/infra-plan.yml)

A **Model Context Protocol (MCP) server** that turns AI agents into GitHub portfolio analysts, plus a thin React client to demo it.

## What it does

Four MCP tools the server exposes to any compliant client (Claude Desktop, Continue, Cursor, the bundled web UI):

| Tool | Purpose |
|---|---|
| `analyze_profile(username)` | Top languages, total stars, most-starred repos, recent activity |
| `evaluate_repository(repo_url)` | Stack, README excerpt, signals: README / tests / CI / Dockerfile |
| `map_to_job(username, job_description)` | Cross-checks public skills against a JD via LangChain + Groq, returns structured match |
| `generate_recruiter_summary(username)` | Streamed Markdown report (token-by-token via MCP progress notifications) |

## Stack

- **Backend** Python 3.12 - FastMCP + FastAPI - httpx + Redis cache - Groq (Llama 3) + LangChain
- **Frontend** React 18 + TypeScript + Vite + Tailwind - `@modelcontextprotocol/sdk` (Streamable HTTP transport)
- **Infra** Terraform - Railway (backend, US region only - SP banned by `validation` block) - Upstash (Redis free tier) - Netlify (frontend)
- **CI/CD** GitHub Actions - GHCR for the Docker image - Dependabot

## Repo layout

```
backend/    FastMCP server (src layout, multi-stage Dockerfile)
frontend/   Vite + React client demoing the 4 tools
terraform/  Railway + Netlify modules; region policy in variables.tf
.github/    CI workflows + Dependabot
docker-compose.yml   Local dev stack (Redis + backend with hot-reload)
```

## Quick start

```bash
cp backend/.env.example backend/.env   # fill GITHUB_TOKEN, GROQ_API_KEY
docker compose up --build              # backend on :8000, redis on :6379
cd frontend && npm install && npm run dev   # UI on :5173
```

Open `http://localhost:5173`. Or hit the MCP transport directly with the official inspector:

```bash
npx @modelcontextprotocol/inspector http://localhost:8000/mcp
```

## Production deploy

Region policy: **US only** (`us-west1` / `us-west2` / `us-east4`). São Paulo (`gru`) is rejected at `terraform plan` time by a `validation` block in `terraform/variables.tf`.

```bash
export TF_VAR_railway_token=...     TF_VAR_netlify_token=...
export TF_VAR_github_token=...      TF_VAR_groq_api_key=...
export TF_VAR_upstash_redis_url=rediss://default:...@us1-XXX.upstash.io:6379
cd terraform && terraform init && terraform apply
```

The backend image is built and pushed to `ghcr.io/<owner>/reporeaver-backend:latest` by the `backend-build-push` workflow on every push to `main`. Railway pulls that tag.

## License

MIT.
