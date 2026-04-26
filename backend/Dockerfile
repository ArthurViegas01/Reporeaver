# =============================================================================
# Reporeaver — Backend Dockerfile (multi-stage)
# -----------------------------------------------------------------------------
# Targets:
#   - development : hot-reload via uvicorn --reload, source mounted as a volume.
#   - production  : slim non-root runtime, pre-compiled deps, no build tools.
#
# Build:
#   docker build --target development -t reporeaver-backend:dev ./backend
#   docker build --target production  -t reporeaver-backend:latest ./backend
# =============================================================================

ARG PYTHON_VERSION=3.12-slim-bookworm

# ---------------------------------------------------------------------------
# Stage 1: builder — install deps into a virtualenv we'll copy into runtime
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential curl \
 && rm -rf /var/lib/apt/lists/*

RUN python -m venv "$VIRTUAL_ENV"

WORKDIR /app

# pyproject.toml drives dependency installation (uv/pip-tools/poetry — your choice).
# For now we accept either pyproject.toml or a requirements.txt.
COPY pyproject.toml* requirements.txt* ./
RUN if [ -f pyproject.toml ]; then \
        pip install --upgrade pip && pip install -e .; \
    elif [ -f requirements.txt ]; then \
        pip install --upgrade pip && pip install -r requirements.txt; \
    else \
        echo "No pyproject.toml or requirements.txt yet — skipping (Step 1 scaffolding)."; \
    fi

# ---------------------------------------------------------------------------
# Stage 2: development — keep build tools, mount source as a volume
# ---------------------------------------------------------------------------
FROM builder AS development

ENV ENVIRONMENT=development \
    LOG_LEVEL=DEBUG

WORKDIR /app
COPY src ./src

EXPOSE 8000

# Hot-reload entrypoint. Replace `reporeaver.server:app` with the actual ASGI
# app object once Step 2 (Python implementation) lands.
CMD ["python", "-m", "uvicorn", "reporeaver.server:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--reload", "--reload-dir", "/app/src"]

# ---------------------------------------------------------------------------
# Stage 3: production — slim, non-root, no build tools
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    ENVIRONMENT=production

RUN groupadd --system --gid 1001 app \
 && useradd  --system --uid 1001 --gid app --no-create-home app

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app
COPY --chown=app:app src ./src

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=2).status==200 else 1)" || exit 1

CMD ["python", "-m", "uvicorn", "reporeaver.server:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2"]
