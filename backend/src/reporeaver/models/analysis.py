"""Pydantic models for the structured outputs of MCP tools."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LanguageStat(BaseModel):
    language: str
    repo_count: int
    percentage: float = Field(ge=0.0, le=100.0)


class ProfileAnalysis(BaseModel):
    """Output of analyze_profile."""

    model_config = ConfigDict(extra="forbid")

    username: str
    name: str | None
    bio: str | None
    public_repos: int
    followers: int
    following: int
    total_stars: int
    top_languages: list[LanguageStat]
    most_starred: list[dict] = Field(default_factory=list)
    recent_activity: list[dict] = Field(default_factory=list)
    profile_url: str | None
    analyzed_at: datetime


class RepositoryEvaluation(BaseModel):
    """Output of evaluate_repository."""

    model_config = ConfigDict(extra="forbid")

    owner: str
    name: str
    full_name: str
    description: str | None
    primary_language: str | None
    languages_breakdown: dict[str, int]
    stars: int
    forks: int
    open_issues: int
    topics: list[str]
    has_readme: bool
    readme_excerpt: str | None
    has_tests: bool
    has_ci: bool
    has_dockerfile: bool
    license: str | None
    last_pushed: datetime | None
    architecture_signals: list[str]
    url: str | None


class JobMatchResult(BaseModel):
    """Output of map_to_job."""

    model_config = ConfigDict(extra="forbid")

    username: str
    overall_match_score: int = Field(ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    gaps: list[str]
    summary: str
