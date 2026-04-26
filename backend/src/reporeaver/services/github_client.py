"""
Async GitHub REST API client with Redis-backed caching.

Caching strategy:
  - User profile : key gh:user:{username}        TTL = settings.cache_ttl_seconds
  - User repos   : key gh:repos:{username}       TTL = settings.cache_ttl_seconds
  - Single repo  : key gh:repo:{owner}/{repo}    TTL = settings.cache_ttl_seconds
  - Languages    : key gh:lang:{owner}/{repo}    TTL = settings.cache_ttl_seconds
  - README       : key gh:readme:{owner}/{repo}  TTL = settings.cache_ttl_seconds
  - Repo tree    : key gh:tree:{owner}/{repo}    TTL = settings.cache_ttl_seconds
"""
from __future__ import annotations

import base64
from typing import Any

import httpx

from reporeaver.config import Settings
from reporeaver.logging_config import get_logger
from reporeaver.models.github import GitHubRepo, GitHubUser
from reporeaver.services.cache_service import CacheService

log = get_logger(__name__)

PER_PAGE = 100
MAX_PAGES = 5  # = 500 repos max - good enough for portfolio analysis


class GitHubAPIError(RuntimeError):
    """Raised on non-recoverable GitHub API errors (auth, 404, rate-limit, etc.)."""


class GitHubClient:
    def __init__(self, settings: Settings, cache: CacheService) -> None:
        self._settings = settings
        self._cache = cache
        self._http = httpx.AsyncClient(
            base_url=settings.github_api_base,
            headers={
                "Authorization": f"Bearer {settings.github_token.get_secret_value()}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "reporeaver/0.1",
            },
            timeout=httpx.Timeout(15.0, connect=5.0),
            http2=False,
        )

    async def aclose(self) -> None:
        await self._http.aclose()

    # -- Internal helpers -----------------------------------------------------

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        try:
            resp = await self._http.get(path, params=params)
        except httpx.TimeoutException as exc:
            raise GitHubAPIError(f"GitHub API timeout: {path}") from exc

        if resp.status_code == 404:
            raise GitHubAPIError(f"Not found: {path}")
        if resp.status_code == 403 and "rate limit" in resp.text.lower():
            raise GitHubAPIError("GitHub rate limit exceeded - try again later.")
        if resp.status_code >= 400:
            raise GitHubAPIError(f"GitHub {resp.status_code}: {resp.text[:200]}")
        return resp.json()

    async def _get_cached(self, cache_key: str, path: str, params: dict | None = None) -> Any:
        cached = await self._cache.get_json(cache_key)
        if cached is not None:
            log.debug("github.cache_hit", key=cache_key)
            return cached
        data = await self._get(path, params)
        await self._cache.set_json(cache_key, data, self._settings.cache_ttl_seconds)
        log.debug("github.cache_miss", key=cache_key)
        return data

    # -- Public API -----------------------------------------------------------

    async def get_user(self, username: str) -> GitHubUser:
        data = await self._get_cached(f"gh:user:{username}", f"/users/{username}")
        return GitHubUser.model_validate(data)

    async def list_user_repos(self, username: str) -> list[GitHubRepo]:
        cache_key = f"gh:repos:{username}"
        cached = await self._cache.get_json(cache_key)
        if cached is not None:
            return [GitHubRepo.model_validate(r) for r in cached]

        all_repos: list[dict] = []
        for page in range(1, MAX_PAGES + 1):
            batch = await self._get(
                f"/users/{username}/repos",
                params={"per_page": PER_PAGE, "page": page, "sort": "pushed"},
            )
            if not batch:
                break
            all_repos.extend(batch)
            if len(batch) < PER_PAGE:
                break

        await self._cache.set_json(cache_key, all_repos, self._settings.cache_ttl_seconds)
        return [GitHubRepo.model_validate(r) for r in all_repos]

    async def get_repo(self, owner: str, repo: str) -> GitHubRepo:
        data = await self._get_cached(f"gh:repo:{owner}/{repo}", f"/repos/{owner}/{repo}")
        return GitHubRepo.model_validate(data)

    async def get_repo_languages(self, owner: str, repo: str) -> dict[str, int]:
        return await self._get_cached(
            f"gh:lang:{owner}/{repo}", f"/repos/{owner}/{repo}/languages"
        )

    async def get_readme(self, owner: str, repo: str) -> str | None:
        cache_key = f"gh:readme:{owner}/{repo}"
        cached = await self._cache.get_json(cache_key)
        if cached is not None:
            return cached if cached != "" else None
        try:
            data = await self._get(f"/repos/{owner}/{repo}/readme")
        except GitHubAPIError:
            await self._cache.set_json(cache_key, "", self._settings.cache_ttl_seconds)
            return None
        encoded = data.get("content", "")
        try:
            text = base64.b64decode(encoded).decode("utf-8", errors="replace")
        except (ValueError, UnicodeDecodeError):
            text = ""
        await self._cache.set_json(cache_key, text, self._settings.cache_ttl_seconds)
        return text or None

    async def list_repo_root(self, owner: str, repo: str, branch: str = "main") -> list[str]:
        """List filenames at the root of a repo - used for arch signal detection."""
        cache_key = f"gh:tree:{owner}/{repo}"
        cached = await self._cache.get_json(cache_key)
        if cached is not None:
            return cached
        try:
            data = await self._get(f"/repos/{owner}/{repo}/contents", params={"ref": branch})
        except GitHubAPIError:
            return []
        names = [item["name"] for item in data if isinstance(item, dict)]
        await self._cache.set_json(cache_key, names, self._settings.cache_ttl_seconds)
        return names
