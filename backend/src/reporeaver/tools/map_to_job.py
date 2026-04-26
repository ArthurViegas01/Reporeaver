"""MCP tool: map_to_job(username, job_description). Uses LangChain + Groq."""

from __future__ import annotations

import json

from mcp.server.fastmcp import FastMCP
from pydantic import ValidationError

from reporeaver.logging_config import get_logger
from reporeaver.models.analysis import JobMatchResult, ProfileAnalysis
from reporeaver.services.github_client import GitHubAPIError, GitHubClient
from reporeaver.services.llm_service import LLMService
from reporeaver.services.profile_analyzer import ProfileAnalyzer

log = get_logger(__name__)


def _profile_to_text(p: ProfileAnalysis) -> str:
    """Turn a ProfileAnalysis into a compact text description for the LLM."""
    langs = ", ".join(f"{ls.language} ({ls.percentage}%)" for ls in p.top_languages) or "n/a"
    starred = "; ".join(
        f"{r['name']} ({r.get('stars', 0)} stars, {r.get('language') or 'mixed'})"
        for r in p.most_starred[:5]
    )
    return (
        f"GitHub user: @{p.username}\n"
        f"Name: {p.name or 'unknown'}\n"
        f"Bio: {p.bio or '-'}\n"
        f"Public repos: {p.public_repos}\n"
        f"Total stars: {p.total_stars}\n"
        f"Top languages: {langs}\n"
        f"Most-starred projects: {starred or '-'}\n"
    )


def register(
    mcp: FastMCP,
    github: GitHubClient,
    analyzer: ProfileAnalyzer,
    llm: LLMService,
) -> None:
    @mcp.tool(
        name="map_to_job",
        description=(
            "Cross-reference a GitHub developer's public skills against a job "
            "description. Returns a structured match (score, matched/missing skills, "
            "strengths, gaps, summary)."
        ),
    )
    async def map_to_job(username: str, job_description: str) -> JobMatchResult:
        if not username or not username.strip():
            raise ValueError("username must not be empty")
        if not job_description or len(job_description.strip()) < 30:
            raise ValueError("job_description must be at least 30 characters of meaningful text")

        log.info("tool.map_to_job.start", username=username)
        try:
            user = await github.get_user(username.strip())
            repos = await github.list_user_repos(username.strip())
        except GitHubAPIError as exc:
            raise ValueError(str(exc)) from exc

        profile = analyzer.analyze(user, repos)
        profile_text = _profile_to_text(profile)

        raw = await llm.map_to_job_structured(profile_text, job_description.strip())

        # Defensive fallback: if the LLM returned a string, try to parse it.
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise ValueError(f"LLM returned non-JSON: {exc}") from exc

        try:
            return JobMatchResult(username=profile.username, **raw)
        except ValidationError as exc:
            raise ValueError(f"LLM output failed validation: {exc}") from exc
