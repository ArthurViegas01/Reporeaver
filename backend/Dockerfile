# =============================================================================
# Devscope Backend Dockerfile (multi-stage)
#
# Build context: ./backend  (both docker-compose and CI use this)
#
# Targets:
#   development  hot-reload via uvicorn --reload, source mounted as a volume
#   production   slim non-root runtime, installed package, no build tools
#
# Usage (from repo root):
#   docker build --target development -t devscope-backend:dev  -f backend/Dockerfile backend/
#   docker build --target production  -t devscope-backend:prod -f backend/Dockerfile backend/
# =============================================================================

ARG PYTHON_VERSION=3.12-slim-bookworm

# ---------------------------------------------------------------------------
# Stage 1: builder - install package + all deps into a virtualenv
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN python -m venv "$VIRTUAL_ENV"

WORKDIR /build

# Copy package manifest and source, then install in one layer.
# Deps are resolved once here; both dev and prod stages inherit this venv.
COPY pyproject.toml README.md* ./
COPY src ./src

RUN pip install --upgrade pip setuptools wheel \
 && pip install --no-build-isolation .

# ---------------------------------------------------------------------------
# Stage 2: development - inherits installed venv, hot-reloads from volume
# ---------------------------------------------------------------------------
FROM builder AS development

ENV ENVIRONMENT=development \
    LOG_LEVEL=DEBUG \
    PYTHONPATH=/app/src

WORKDIR /app

# Source is mounted via docker-compose volume for hot-reload.
# Copy here so the image works standalone too.
COPY src ./src

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "devscope.server:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--reload", "--reload-dir", "/app/src"]

# ---------------------------------------------------------------------------
# Stage 3: production - slim, non-root, package installed in venv
# ---------------------------------------------------------------------------
FROM python:${PYTHON_VERSION} AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    ENVIRONMENT=production

RUN groupadd --system --gid 1001 app \
 && useradd  --system --uid 1001 --gid app --no-create-home app

# Copy the complete venv (with devscope installed as a package).
COPY --from=builder /opt/venv /opt/venv

WORKDIR /app
USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=2).status==200 else 1)" || exit 1

CMD ["python", "-m", "uvicorn", "devscope.server:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2"]
