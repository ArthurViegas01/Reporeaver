"""Shared pytest fixtures."""
from __future__ import annotations

from datetime import datetime, timezone

import pytest

from reporeaver.models.github import GitHubRepo, GitHubUser


@pytest.fixture
def sample_user() -> GitHubUser:
    return GitHubUser(
        login="octocat",
        id=1,
        name="The Octocat",
        bio="Mascot of GitHub",
        public_repos=8,
        followers=4200,
        following=10,
        html_url="https://github.com/octocat",
        created_at=datetime(2011, 1, 25, tzinfo=timezone.utc),
    )


@pytest.fixture
def sample_repos() -> list[GitHubRepo]:
    base = dict(
        forks_count=0,
        open_issues_count=0,
        archived=False,
        private=False,
        fork=False,
        pushed_at=datetime(2025, 6, 1, tzinfo=timezone.utc),
    )
    return [
        GitHubRepo(
            id=1, name="hello-world", full_name="octocat/hello-world",
            language="Python", stargazers_count=1500, **base,
        ),
        GitHubRepo(
            id=2, name="spoon-knife", full_name="octocat/spoon-knife",
            language="Python", stargazers_count=300, **base,
        ),
        GitHubRepo(
            id=3, name="legacy-fork", full_name="octocat/legacy-fork",
            language="Java", stargazers_count=999,
            **{**base, "fork": True},  # should be filtered out
        ),
        GitHubRepo(
            id=4, name="ts-stuff", full_name="octocat/ts-stuff",
            language="TypeScript", stargazers_count=42, **base,
        ),
        GitHubRepo(
            id=5, name="archived", full_name="octocat/archived",
            language="Python", stargazers_count=10000,
            **{**base, "archived": True},  # should be filtered out
        ),
    ]
