"""
MCP tool registration.

`register_tools(mcp, services)` is called once at server startup. Each tool is
a thin adapter: validates input -> calls service layer -> returns Pydantic model.
"""

from __future__ import annotations

from dataclasses import dataclass

from mcp.server.fastmcp import FastMCP

from reporeaver.services import GitHubClient, LLMService, ProfileAnalyzer
from reporeaver.tools.analyze_profile import register as register_analyze_profile
from reporeaver.tools.evaluate_repository import register as register_evaluate_repo
from reporeaver.tools.generate_recruiter_summary import (
    register as register_generate_summary,
)
from reporeaver.tools.map_to_job import register as register_map_to_job


@dataclass
class Services:
    github: GitHubClient
    analyzer: ProfileAnalyzer
    llm: LLMService


def register_tools(mcp: FastMCP, services: Services) -> None:
    register_analyze_profile(mcp, services.github, services.analyzer)
    register_evaluate_repo(mcp, services.github)
    register_map_to_job(mcp, services.github, services.analyzer, services.llm)
    register_generate_summary(mcp, services.github, services.analyzer, services.llm)
