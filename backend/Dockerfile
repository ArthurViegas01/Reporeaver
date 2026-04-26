# =============================================================================
# Reporeaver — Backend Dockerfile (multi-stage)
# -----------------------------------------------------------------------------
# Targets:
#   - development : hot-reload via uvicorn --reload, source mounted as a volume.
#   - production  : slim non-root runtime, pre-compiled deps, no build tools.
#
# Build (from repo root):
#   docker build --target development -t reporeaver-backend:dev -f backend/Dockerfile .
#   docker build --target production  -t reporeaver-backend:latest -f backend/Dockerfile .
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

# Ajuste monorepo: Copia os arquivos de dependências da pasta backend/
COPY backend/pyproject.toml* backend/requirements.txt* ./

# Instala as dependências (lendo o arquivo que foi copiado para a raiz /app do container)
RUN if [ -f pyproject.toml ]; then \
        pip install --upgrade pip && pip install --no-build-isolation \
            $(python -c "import tomllib; d=tomllib.load(open('pyproject.toml','rb')); print(' '.join(d['project']['dependencies']))"); \
    elif [ -f requirements.txt ]; then \
        pip install --upgrade pip && pip install -r requirements.txt; \
    else \
        echo "No pyproject.toml or requirements.txt found."; \
    fi

# ---------------------------------------------------------------------------
# Stage 2: development — keep build tools, mount source as a volume
# ---------------------------------------------------------------------------
FROM builder AS development

ENV ENVIRONMENT=development \
    LOG_LEVEL=DEBUG

WORKDIR /app
# Ajuste monorepo: Copia o código fonte da pasta backend/src
COPY backend/src ./src

EXPOSE 8000

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

# Ajuste monorepo: Copia o código fonte da pasta backend/src com as permissões corretas
COPY --chown=app:app backend/src ./src

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health', timeout=2).status==200 else 1)" || exit 1

CMD ["python", "-m", "uvicorn", "reporeaver.server:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2"]