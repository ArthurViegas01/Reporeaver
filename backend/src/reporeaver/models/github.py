"""Pydantic models mirroring the subset of GitHub API responses we consume."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GitHubUser(BaseModel):
    """Subset of /users/{username} response."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    login: str
    id: int
    name: str | None = None
    company: str | None = None
    blog: str | None = None
    location: str | None = None
    bio: str | None = None
    public_repos: int = 0
    followers: int = 0
    following: int = 0
    avatar_url: str | None = None
    html_url: str | None = None
    created_at: datetime | None = None


class GitHubRepo(BaseModel):
    """Subset of /repos/{owner}/{repo} or /users/{user}/repos response."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: int
    name: str
    full_name: str
    description: str | None = None
    fork: bool = False
    archived: bool = False
    private: bool = False
    language: str | None = None
    languages_url: str | None = None
    stargazers_count: int = Field(0, alias="stargazers_count")
    forks_count: int = 0
    open_issues_count: int = 0
    pushed_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    topics: list[str] = Field(default_factory=list)
    html_url: str | None = None
    default_branch: str = "main"
    size: int = 0
