"""
Per-IP rate limiter using Redis - implemented as a pure ASGI middleware.

Why not BaseHTTPMiddleware: it buffers the full response body before sending,
which breaks the SSE streams used by the MCP streamable-HTTP transport. A pure
ASGI middleware passes receive/send through unchanged, so streams work correctly.

Why not fastapi-limiter: FastAPI's dependency injection does not reach into
mounted Starlette sub-apps. Middleware sees every request including the mounted
MCP app, so limiting happens at the right layer.

XFF handling: we take the Nth entry from the right in X-Forwarded-For, where
N = settings.trusted_proxy_depth (default 1). When Railway (or any single load
balancer) is the only proxy, the rightmost entry is what Railway appended - the
real client IP that Railway received. Clients cannot inject into that position.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING

import redis.asyncio as redis
from starlette.types import ASGIApp, Receive, Scope, Send

from devscope.logging_config import get_logger

if TYPE_CHECKING:
    pass

log = get_logger(__name__)

_RATE_LIMIT_LUA = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
"""


def _extract_ip(scope: Scope, proxy_depth: int) -> str:
    headers = dict(scope.get("headers", []))
    xff = headers.get(b"x-forwarded-for", b"").decode("latin-1", errors="replace").strip()
    if xff:
        parts = [p.strip() for p in xff.split(",") if p.strip()]
        if parts:
            idx = max(len(parts) - proxy_depth, 0)
            return parts[idx]
    x_real = headers.get(b"x-real-ip", b"").decode("latin-1", errors="replace").strip()
    if x_real:
        return x_real
    client = scope.get("client")
    return client[0] if client else "unknown"


class RateLimitMiddleware:
    """Fixed-window-per-minute rate limiter applied to every HTTP request."""

    def __init__(
        self,
        app: ASGIApp,
        *,
        redis_client: redis.Redis,
        per_minute: int,
        proxy_depth: int = 1,
        exempt_paths: tuple[str, ...] = ("/health", "/metrics"),
        namespace: str = "rl",
    ) -> None:
        self._app = app
        self._redis = redis_client
        self._per_minute = per_minute
        self._proxy_depth = proxy_depth
        self._exempt = exempt_paths
        self._ns = namespace
        self._script = redis_client.register_script(_RATE_LIMIT_LUA)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self._app(scope, receive, send)
            return

        path: str = scope.get("path", "/")
        if any(path.startswith(p) for p in self._exempt):
            await self._app(scope, receive, send)
            return

        ip = _extract_ip(scope, self._proxy_depth)
        key = f"{self._ns}:{ip}"

        try:
            current, ttl = await self._script(keys=[key], args=[60])
        except Exception:  # noqa: BLE001
            log.warning("ratelimit.redis_error", ip=ip, path=path)
            await self._app(scope, receive, send)
            return

        current = int(current)
        retry_after = max(int(ttl), 1)

        if current > self._per_minute:
            log.info("ratelimit.exceeded", ip=ip, path=path, count=current)
            await self._send_429(send, retry_after)
            return

        async def send_with_headers(message: dict) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                remaining = max(self._per_minute - current, 0)
                headers += [
                    (b"x-ratelimit-limit", str(self._per_minute).encode()),
                    (b"x-ratelimit-remaining", str(remaining).encode()),
                    (b"x-ratelimit-reset", str(retry_after).encode()),
                ]
                message = {**message, "headers": headers}
            await send(message)

        await self._app(scope, receive, send_with_headers)

    async def _send_429(self, send: Send, retry_after: int) -> None:
        body = json.dumps(
            {
                "error": "rate_limit_exceeded",
                "limit": self._per_minute,
                "window_seconds": 60,
                "retry_after_seconds": retry_after,
            }
        ).encode()
        await send(
            {
                "type": "http.response.start",
                "status": 429,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"retry-after", str(retry_after).encode()),
                    (b"x-ratelimit-limit", str(self._per_minute).encode()),
                    (b"x-ratelimit-remaining", b"0"),
                    (b"x-ratelimit-reset", str(retry_after).encode()),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body, "more_body": False})
