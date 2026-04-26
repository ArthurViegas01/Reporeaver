"""MCP tool: analyze_profile(username)."""

from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from reporeaver.logging_config import get_logger
from reporeaver.models.analysis import ProfileAnalysis
from reporeaver.services.github_client import GitHubAPIError, GitHubClient
from reporeaver.services.profile_analyzer import ProfileAnalyzer

log = get_logger(__name__)


def register(mcp: FastMCP, github: GitHubClient, analyzer: ProfileAnalyzer) -> None:
    @mcp.tool(
        name="analyze_profile",
        description=(
            "Analyse a GitHub user's public profile: top languages, total stars, "
            "most-starred repositories, and recent activity. Returns a structured "
            "ProfileAnalysis."
        ),
    )
    async def analyze_profile(username: str) -> ProfileAnalysis:
        if not username or not username.strip():
            raise ValueError("username must not be empty")
        log.info("tool.analyze_profile.start", username=username)

        try:
            user, repos = await _fetch(github, username.strip())
        except GitHubAPIError as exc:
            raise ValueError(str(exc)) from exc

        result = analyzer.analyze(user, repos)
        log.info(
            "tool.analyze_profile.done",
            username=username,
            repos=len(repos),
            stars=result.total_stars,
        )
        return result


async def _fetch(github: GitHubClient, username: str):
    user = await github.get_user(username)
    repos = await github.list_user_repos(username)
    return user, repos
