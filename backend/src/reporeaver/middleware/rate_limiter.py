"""
Per-IP rate limiter using Redis.

Why custom (instead of pure fastapi-limiter):
  fastapi-limiter exposes itself as a FastAPI dependency. The MCP transport is
  a *mounted* Starlette ASGI app, so FastAPI's DI doesn't reach into it. A
  Starlette middleware *does* see every request, including the mounted ones,
  so we implement the same fixed-window-per-minute logic at the middleware
  layer using Redis INCR + EXPIRE atomically.
"""
from __future__ import annotations

from typing import Callable

import redis.asyncio as redis
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from reporeaver.logging_config import get_logger

log = get_logger(__name__)

# Atomic Lua: increment a counter, set TTL on first hit, return current count + ttl.
_RATE_LIMIT_LUA = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
"""


def _client_ip(request: Request) -> str:
    """Best-effort client IP. Trusts X-Forwarded-For only the first hop."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Fixed-window-per-minute limiter applied to every incoming request."""

    def __init__(
        self,
        app,
        *,
        redis_client: redis.Redis,
        per_minute: int,
        exempt_paths: tuple[str, ...] = ("/health", "/metrics"),
        namespace: str = "rl",
    ) -> None:
        super().__init__(app)
        self._redis = redis_client
        self._per_minute = per_minute
        self._exempt = exempt_paths
        self._ns = namespace
        self._script = redis_client.register_script(_RATE_LIMIT_LUA)

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        path = request.url.path
        if any(path.startswith(p) for p in self._exempt):
            return await call_next(request)

        ip = _client_ip(request)
        key = f"{self._ns}:{ip}:{path.split('/')[1] if '/' in path[1:] else 'root'}"

        try:
            current, ttl = await self._script(keys=[key], args=[60])
        except Exception:  # noqa: BLE001 - cache outage must never 500 the user
            log.warning("ratelimit.redis_error", ip=ip, path=path)
            return await call_next(request)

        retry_after = max(int(ttl), 1)
        if int(current) > self._per_minute:
            log.info("ratelimit.exceeded", ip=ip, path=path, count=int(current))
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "limit": self._per_minute,
                    "window_seconds": 60,
                    "retry_after_seconds": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self._per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_after),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self._per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            max(self._per_minute - int(current), 0)
        )
        response.headers["X-RateLimit-Reset"] = str(retry_after)
        return response
