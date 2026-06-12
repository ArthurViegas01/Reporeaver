"""MCP tool: analyze_profile(username)."""

from __future__ import annotations

import re

from mcp.server.fastmcp import FastMCP

from devscope.logging_config import get_logger
from devscope.models.analysis import ProfileAnalysis
from devscope.services.github_client import GitHubAPIError, GitHubClient
from devscope.services.profile_analyzer import ProfileAnalyzer

log = get_logger(__name__)

# GitHub username: 1-39 chars, alphanumeric or hyphen, may not start or end
# with a hyphen. The trailing alnum is required *inside* the optional group, so
# a single char is valid but a trailing hyphen is not.
_USERNAME_RE = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$")


def _validate_username(username: str) -> str:
    clean = username.strip()
    if not clean:
        raise ValueError("username must not be empty")
    if not _USERNAME_RE.match(clean):
        raise ValueError(
            "username must contain only letters, digits, and hyphens, "
            "and must not start or end with a hyphen (GitHub username format)"
        )
    return clean


def register(mcp: FastMCP, github: GitHubClient, analyzer: ProfileAnalyzer) -> None:
    @mcp.tool(
        name="analyze_profile",
        description=(
            "Analyse a GitHub user's public profile: top languages by percentage, "
            "total stars, most-starred repositories, and recent push activity. "
            "Returns a structured ProfileAnalysis. Pass a plain GitHub username "
            "(e.g. 'torvalds'), not a URL."
        ),
    )
    async def analyze_profile(username: str) -> ProfileAnalysis:
        clean = _validate_username(username)
        log.info("tool.analyze_profile.start", username=clean)

        try:
            user, repos = await _fetch(github, clean)
        except GitHubAPIError as exc:
            raise ValueError(str(exc)) from exc

        result = analyzer.analyze(user, repos)
        log.info(
            "tool.analyze_profile.done",
            username=clean,
            repos=len(repos),
            stars=result.total_stars,
        )
        return result


async def _fetch(github: GitHubClient, username: str):
    user = await github.get_user(username)
    repos = await github.list_user_repos(username)
    return user, repos
