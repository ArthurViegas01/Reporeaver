# =============================================================================
# Reporeaver - convenience targets for local development
# =============================================================================

.PHONY: help up down logs ps shell-backend shell-redis test lint format \
        install dev deploy-plan deploy-apply clean

help:  ## Show this help.
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Local dev stack --------------------------------------------------------

up:  ## Start the local dev stack (backend + redis).
	docker compose up --build -d
	@echo "Backend:  http://localhost:8000"
	@echo "Health:   http://localhost:8000/health"
	@echo "MCP:      http://localhost:8000/mcp"

down:  ## Stop and remove the local dev stack.
	docker compose down

logs:  ## Tail logs.
	docker compose logs -f --tail=100

ps:  ## Show running containers.
	docker compose ps

shell-backend:  ## Shell into the backend container.
	docker compose exec backend /bin/bash

shell-redis:  ## Open a redis-cli inside the container.
	docker compose exec redis redis-cli -a $${REDIS_PASSWORD:-devpassword}

# --- Backend dev (host) -----------------------------------------------------

install:  ## Install backend Python deps in editable mode (host).
	cd backend && pip install -e ".[dev]"

dev:  ## Run the backend with hot-reload (host, requires Redis already up).
	cd backend && python -m uvicorn reporeaver.server:app \
		--host 0.0.0.0 --port 8000 --reload --reload-dir src

test:  ## Run the test suite.
	cd backend && python -m pytest -ra

lint:  ## Lint with ruff.
	cd backend && python -m ruff check src tests

format:  ## Format with ruff.
	cd backend && python -m ruff format src tests

# --- Terraform --------------------------------------------------------------

deploy-plan:  ## terraform plan (requires TF_VAR_* exported).
	cd terraform && terraform init -upgrade && terraform plan

deploy-apply:  ## terraform apply (requires TF_VAR_* exported).
	cd terraform && terraform apply

# --- Cleanup ---------------------------------------------------------------

clean:  ## Remove caches and build artifacts.
	find . -type d -name '__pycache__' -prune -exec rm -rf {} +
	find . -type d -name '.pytest_cache' -prune -exec rm -rf {} +
	find . -type d -name '.ruff_cache' -prune -exec rm -rf {} +
	find . -type d -name '.mypy_cache' -prune -exec rm -rf {} +
