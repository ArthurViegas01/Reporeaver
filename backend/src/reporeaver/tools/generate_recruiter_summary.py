"""
MCP tool: generate_recruiter_summary(username) - streamed Markdown report.

Streaming uses Context.report_progress to emit incremental tokens to the client.
The final tool result is the full assembled Markdown - clients can choose to
either render progress events in real time or wait for the final return value.
"""

from __future__ import annotations

from mcp.server.fastmcp import Context, FastMCP

from reporeaver.logging_config import get_logger
from reporeaver.services.github_client import GitHubAPIError, GitHubClient
from reporeaver.services.llm_service import LLMService
from reporeaver.services.profile_analyzer import ProfileAnalyzer

log = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are an experienced engineering hiring manager writing a concise, candid, "
    "non-promotional report on a software engineer based ONLY on the GitHub data "
    "provided. Use Markdown. Structure:\n"
    "## Summary\n"
    "## Technical strengths\n"
    "## Areas to probe in interview\n"
    "## Likely seniority signal\n"
    "## Recommended next step\n"
    "Keep the whole report under 350 words. Do not invent facts. If the data is "
    "thin, say so explicitly."
)


def register(
    mcp: FastMCP,
    github: GitHubClient,
    analyzer: ProfileAnalyzer,
    llm: LLMService,
) -> None:
    @mcp.tool(
        name="generate_recruiter_summary",
        description=(
            "Synthesise a streamed Markdown recruiter report for a GitHub user. "
            "Tokens are emitted as progress events; the final return value is the "
            "complete Markdown document."
        ),
    )
    async def generate_recruiter_summary(username: str, ctx: Context) -> str:
        if not username or not username.strip():
            raise ValueError("username must not be empty")

        log.info("tool.generate_recruiter_summary.start", username=username)
        try:
            user = await github.get_user(username.strip())
            repos = await github.list_user_repos(username.strip())
        except GitHubAPIError as exc:
            raise ValueError(str(exc)) from exc

        profile = analyzer.analyze(user, repos)

        # Build the LLM prompt from the structured profile.
        langs = (
            ", ".join(f"{ls.language} {ls.percentage}%" for ls in profile.top_languages)
            or "none reported"
        )
        top = (
            "\n".join(
                f"- {r['name']} ({r.get('stars', 0)} stars, "
                f"{r.get('language') or 'mixed'}): {r.get('description') or 'no description'}"
                for r in profile.most_starred[:5]
            )
            or "- (no starred repos)"
        )

        user_prompt = (
            f"User: @{profile.username} ({profile.name or 'no display name'})\n"
            f"Bio: {profile.bio or 'none'}\n"
            f"Public repos: {profile.public_repos} | Total stars: {profile.total_stars} | "
            f"Followers: {profile.followers}\n"
            f"Top languages: {langs}\n\n"
            f"Top repositories:\n{top}\n"
        )

        chunks: list[str] = []
        token_count = 0
        async for chunk in llm.astream(SYSTEM_PROMPT, user_prompt):
            chunks.append(chunk)
            token_count += 1
            # Report progress every ~10 chunks - cheaper than per-token I/O.
            if token_count % 10 == 0:
                await ctx.report_progress(
                    progress=token_count,
                    total=None,
                    message="".join(chunks),
                )

        markdown = "".join(chunks)
        await ctx.report_progress(progress=token_count, total=token_count, message=markdown)
        log.info(
            "tool.generate_recruiter_summary.done",
            username=username,
            tokens=token_count,
            length=len(markdown),
        )
        return markdown
