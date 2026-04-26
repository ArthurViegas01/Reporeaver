"""
ASGI entrypoint. Composes:
  - FastAPI app (host) with /health, CORS, lifespan-managed services
  - FastMCP server mounted under /mcp via streamable HTTP transport
  - RateLimitMiddleware applied to all incoming requests
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import redis.asyncio as redis_async
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from mcp.server.fastmcp import FastMCP

from reporeaver.config import Settings, get_settings
from reporeaver.logging_config import configure_logging, get_logger
from reporeaver.middleware import RateLimitMiddleware
from reporeaver.services import GitHubClient, LLMService, ProfileAnalyzer
from reporeaver.services.cache_service import CacheService
from reporeaver.tools import Services, register_tools

log = get_logger(__name__)


def _build_mcp(services: Services, settings: Settings) -> FastMCP:
    mcp = FastMCP(
        name="reporeaver",
        instructions=(
            "GitHub Portfolio Intel - tools to analyse public GitHub profiles, "
            "evaluate single repositories, cross-check skills against job "
            "descriptions, and generate streamed recruiter summaries."
        ),
        host=settings.mcp_host,
        port=settings.mcp_port,
    )
    register_tools(mcp, services)
    return mcp


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Wire up Redis, services, and FastMCP on startup; tear down on shutdown."""
    settings: Settings = app.state.settings
    redis_client: redis_async.Redis = app.state.redis
    github: GitHubClient = app.state.github
    mcp_session_manager = app.state.mcp_session_manager

    configure_logging()
    log.info(
        "server.startup",
        env=settings.environment,
        region=settings.deploy_region,
        model=settings.groq_model,
    )

    await redis_client.ping()
    await FastAPILimiter.init(redis_client)

    async with mcp_session_manager.run():
        try:
            yield
        finally:
            log.info("server.shutdown")
            await github.aclose()
            await FastAPILimiter.close()
            await redis_client.aclose()


def create_app() -> FastAPI:
    settings = get_settings()

    # Create base clients synchronously (connections are made async when used)
    redis_client = redis_async.from_url(
        str(settings.redis_url), encoding="utf-8", decode_responses=False
    )
    cache = CacheService(redis_client)
    github = GitHubClient(settings, cache)
    analyzer = ProfileAnalyzer()
    llm = LLMService(settings)
    services = Services(github=github, analyzer=analyzer, llm=llm)

    app = FastAPI(
        title="Reporeaver MCP",
        version="0.1.0",
        description="GitHub Portfolio Intel - MCP server",
        lifespan=lifespan,
        redirect_slashes=False,
    )

    mcp = _build_mcp(services, settings)
    # session_manager is created lazily inside streamable_http_app()
    mcp_asgi = mcp.streamable_http_app()

    # Stash instances on app state for lifespan and healthcheck
    app.state.settings = settings
    app.state.redis = redis_client
    app.state.github = github
    app.state.mcp_session_manager = mcp.session_manager

    # FastMCP v1.x streamable_http_app() has an internal route at /mcp.
    # Mounting at "/" passes the full path to the sub-app so /mcp is matched.
    app.mount("/", mcp_asgi)

    # Add Middlewares (must be outside lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    app.add_middleware(
        RateLimitMiddleware,
        redis_client=redis_client,
        per_minute=settings.rate_limit_per_minute,
    )

    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        """Liveness + readiness probe. Hits Redis to confirm dependency health."""
        s: Settings = app.state.settings
        redis_ok = False
        try:
            await app.state.redis.ping()
            redis_ok = True
        except Exception:  # noqa: BLE001
            pass
        return {
            "status": "ok" if redis_ok else "degraded",
            "environment": s.environment,
            "region": s.deploy_region,
            "model": s.groq_model,
            "redis": "ok" if redis_ok else "down",
            "version": "0.1.0",
        }

    @app.get("/", tags=["meta"])
    async def root() -> dict:
        return {
            "service": "reporeaver",
            "mcp_endpoint": app.state.settings.mcp_path,
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()


def run() -> None:
    """Console-script entrypoint: `reporeaver` (defined in pyproject.toml)."""
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "reporeaver.server:app",
        host=settings.mcp_host,
        port=settings.mcp_port,
        log_level=settings.log_level.lower(),
        reload=not settings.is_production,
    )


if __name__ == "__main__":
    run()