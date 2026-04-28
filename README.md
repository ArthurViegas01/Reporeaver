# Reporeaver

MCP server for GitHub profile analysis. Exposes portfolio intelligence tools to Claude and other LLM clients.

[![backend-ci](https://github.com/arthurpviegas/reporeaver/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/backend-ci.yml)
[![frontend-ci](https://github.com/arthurpviegas/reporeaver/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/frontend-ci.yml)
[![infra-plan](https://github.com/arthurpviegas/reporeaver/actions/workflows/infra-plan.yml/badge.svg)](https://github.com/arthurpviegas/reporeaver/actions/workflows/infra-plan.yml)

## How it works

The Model Context Protocol (MCP) is a standard that lets AI agents call structured tools exposed by an external server over a well-defined transport. This server implements that protocol using FastMCP, registering four tools that any compliant client — Claude Desktop, Cursor, Continue, or the bundled React UI — can invoke by name.

The four tools:

- **`analyze_profile(username)`** — Fetches a user's public repos and returns top languages by percentage, total stars, most-starred repositories, and recent activity.
- **`evaluate_repository(repo_url)`** — Inspects a single repo: primary language, languages breakdown, README excerpt (first 1500 chars), and architecture signals detected from root-level files (Dockerfile, CI config, Makefile, IaC, etc.).
- **`map_to_job(username, job_description)`** — Builds a structured profile from the user's public repos, sends it with the job description to Llama 3 via LangChain, and returns a scored match with matched skills, missing skills, strengths, and gaps.
- **`generate_recruiter_summary(username)`** — Streams a Markdown recruiter report token-by-token using MCP progress notifications. The final return value is the complete document; clients can render it incrementally or wait for the result.

## Architecture

```
MCP client (Claude Desktop / IDE agent / web UI)
    │
    │  JSON-RPC over Streamable HTTP
    ▼
FastMCP  (/mcp)
    │
    ├── Tool dispatcher
    │       ├── GitHub REST API v3  (httpx, up to 500 repos via pagination)
    │       ├── LangChain + Groq    (map_to_job, generate_recruiter_summary)
    │       └── ProfileAnalyzer     (pure Python aggregation)
    │
    └── Redis
            ├── Response cache      (TTL 1 hour, keys namespaced reporeaver:gh:*)
            └── Rate limiter        (fixed window, 30 req/min per IP)
```

FastMCP mounts as an ASGI sub-app under FastAPI. Rate limiting runs as a Starlette middleware so it covers the mounted `/mcp` endpoint — FastAPI's dependency injection doesn't reach into sub-apps.

## Stack

Python 3.12, FastMCP, FastAPI, GitHub REST API v3, httpx, LangChain, Groq / Llama 3.1-70b, Redis, Pydantic v2, structlog, Docker, Railway, Upstash, Netlify, Terraform

## Setup

### Local dev

```bash
cp backend/.env.example backend/.env   # fill in GITHUB_TOKEN and GROQ_API_KEY
make up                                # starts backend on :8000 and Redis on :6379
cd frontend && npm install && npm run dev   # UI on :5173
```

`make up` runs `docker compose up --build -d`. The backend mounts `backend/src` as a volume so source changes hot-reload without rebuilding the image. Redis is only bound to `127.0.0.1` in the local stack.

### Connecting to Claude Desktop

Add this to `claude_desktop_config.json` (with the server running locally):

```json
{
  "mcpServers": {
    "reporeaver": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

On macOS the config is at `~/Library/Application Support/Claude/claude_desktop_config.json`. On Windows it's at `%APPDATA%\Claude\claude_desktop_config.json`.

For any other MCP client, point it at `http://localhost:8000/mcp` using the Streamable HTTP transport.

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:8000/mcp
```

### Production deploy

The backend image is built and pushed to `ghcr.io/arthurpviegas/reporeaver-backend:latest` by the `backend-build-push` workflow on every push to `main`. Railway pulls that tag.

```bash
export TF_VAR_railway_token=...
export TF_VAR_netlify_token=...
export TF_VAR_github_token=...
export TF_VAR_groq_api_key=...
export TF_VAR_upstash_redis_url=rediss://default:<token>@us1-XXX.upstash.io:6379

cd terraform && terraform init && terraform apply
```

Region policy: Railway deployments are restricted to US regions (`us-east4`, `us-west1`, `us-west2`). This is enforced by a `validation` block in `terraform/variables.tf` — any São Paulo or South American region string fails at `terraform plan`.

## Tools reference

| Tool | Input | Returns |
|---|---|---|
| `analyze_profile` | `username: str` | `ProfileAnalysis` — top languages, total stars, most-starred repos, recent activity |
| `evaluate_repository` | `repo_url: str` | `RepositoryEvaluation` — languages, README excerpt, architecture signals, has_tests / has_ci / has_dockerfile |
| `map_to_job` | `username: str`, `job_description: str` | `JobMatchResult` — match score, matched/missing skills, strengths, gaps, summary |
| `generate_recruiter_summary` | `username: str` | Streamed Markdown string — tokens emitted as progress events, full document returned at end |

## Key decisions

- **FastMCP over the raw MCP Python SDK.** FastMCP handles session management, request routing, and transport negotiation. Writing against the raw SDK means implementing all of that manually. The decorator API (`@mcp.tool(...)`) keeps tool registration close to the logic and lets Pydantic v2 models serve directly as return types — the SDK serialises them automatically.

- **1-hour Redis TTL for GitHub responses.** Public GitHub portfolio data — repos, languages, stars — doesn't change on a per-minute basis. A 1-hour TTL keeps the GitHub API well under its rate limits (5,000 req/hour authenticated) even under repeated tool calls across clients, while still reflecting pushes that happened earlier in the day.

- **Railway over Fly.io or Render.** Railway deploys arbitrary Docker images with zero config drift between local and production, has a functional free tier for a server at this scale, and integrates cleanly with the Terraform provider. The region validation block in Terraform makes the deployment policy explicit and machine-enforced rather than a convention someone has to remember.

- **Custom Starlette middleware for rate limiting.** FastAPI's dependency injection system doesn't propagate into mounted ASGI sub-apps. The MCP transport is mounted as a sub-app at `/mcp`, which means `fastapi-limiter`'s decorator-based approach would leave the MCP endpoint unprotected. A `BaseHTTPMiddleware` subclass sees every request at the ASGI layer before routing, so the same fixed-window-per-minute logic covers both the FastAPI routes and the MCP transport.

## License

MIT
