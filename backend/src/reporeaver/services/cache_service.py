"""Thin async Redis wrapper with JSON helpers + namespacing."""
from __future__ import annotations

from typing import Any

import orjson
import redis.asyncio as redis

from reporeaver.logging_config import get_logger

log = get_logger(__name__)


class CacheService:
    """Namespaced JSON cache built on redis.asyncio."""

    def __init__(self, redis_client: redis.Redis, namespace: str = "reporeaver") -> None:
        self._redis = redis_client
        self._ns = namespace

    @classmethod
    async def from_url(cls, url: str, namespace: str = "reporeaver") -> "CacheService":
        client = redis.from_url(url, encoding="utf-8", decode_responses=False)
        # Validate connectivity early so the app fails fast on misconfig.
        await client.ping()
        return cls(client, namespace=namespace)

    @property
    def client(self) -> redis.Redis:
        return self._redis

    def _key(self, key: str) -> str:
        return f"{self._ns}:{key}"

    async def get_json(self, key: str) -> Any | None:
        raw = await self._redis.get(self._key(key))
        if raw is None:
            return None
        try:
            return orjson.loads(raw)
        except orjson.JSONDecodeError:
            log.warning("cache.invalid_json", key=key)
            return None

    async def set_json(self, key: str, value: Any, ttl_seconds: int) -> None:
        payload = orjson.dumps(value, default=str)
        await self._redis.set(self._key(key), payload, ex=ttl_seconds)

    async def delete(self, key: str) -> None:
        await self._redis.delete(self._key(key))

    async def close(self) -> None:
        await self._redis.aclose()
