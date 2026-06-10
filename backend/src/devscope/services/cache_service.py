"""Thin async Redis wrapper with JSON helpers and namespacing."""

from __future__ import annotations

from typing import Any

import orjson
import redis.asyncio as redis

from devscope.logging_config import get_logger

log = get_logger(__name__)


class CacheService:
    """Namespaced JSON cache built on redis.asyncio.

    All public methods fail open on Redis errors: callers receive None on a
    failed get and a silent warning on a failed set. This ensures a Redis outage
    does not degrade tool availability - requests still reach GitHub's API.
    """

    def __init__(self, redis_client: redis.Redis, namespace: str = "devscope") -> None:
        self._redis = redis_client
        self._ns = namespace

    @property
    def client(self) -> redis.Redis:
        return self._redis

    def _key(self, key: str) -> str:
        return f"{self._ns}:{key}"

    async def get_json(self, key: str) -> Any | None:
        try:
            raw = await self._redis.get(self._key(key))
        except Exception:  # noqa: BLE001
            log.warning("cache.get_error", key=key)
            return None
        if raw is None:
            return None
        try:
            return orjson.loads(raw)
        except orjson.JSONDecodeError:
            log.warning("cache.invalid_json", key=key)
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int) -> None:
        try:
            payload = orjson.dumps(value, default=str)
            await self._redis.set(self._key(key), payload, ex=ttl_seconds)
        except Exception:  # noqa: BLE001
            log.warning("cache.set_error", key=key)

    async def delete(self, key: str) -> None:
        try:
            await self._redis.delete(self._key(key))
        except Exception:  # noqa: BLE001
            log.warning("cache.delete_error", key=key)

    async def close(self) -> None:
        await self._redis.aclose()
