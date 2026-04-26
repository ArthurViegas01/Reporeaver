"""Pure-Python analytics over GitHub data. Easy to unit-test without HTTP."""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone

from reporeaver.models.analysis import LanguageStat, ProfileAnalysis
from reporeaver.models.github import GitHubRepo, GitHubUser

# Repos with these properties are noise for portfolio analysis.
def _is_noise(repo: GitHubRepo) -> bool:
    return repo.fork or repo.archived or repo.private


class ProfileAnalyzer:
    """Compute profile-level metrics from GitHub user + repos."""

    def analyze(
        self,
        user: GitHubUser,
        repos: list[GitHubRepo],
        *,
        top_languages_n: int = 5,
        most_starred_n: int = 5,
        recent_activity_n: int = 5,
    ) -> ProfileAnalysis:
        active = [r for r in repos if not _is_noise(r)]

        total_stars = sum(r.stargazers_count for r in active)

        lang_counter: Counter[str] = Counter(
            r.language for r in active if r.language is not None
        )
        total_with_lang = sum(lang_counter.values()) or 1
        top_languages = [
            LanguageStat(
                language=lang,
                repo_count=count,
                percentage=round(100 * count / total_with_lang, 2),
            )
            for lang, count in lang_counter.most_common(top_languages_n)
        ]

        most_starred = sorted(active, key=lambda r: r.stargazers_count, reverse=True)[
            :most_starred_n
        ]
        recent = sorted(
            (r for r in active if r.pushed_at is not None),
            key=lambda r: r.pushed_at or datetime.min,
            reverse=True,
        )[:recent_activity_n]

        return ProfileAnalysis(
            username=user.login,
            name=user.name,
            bio=user.bio,
            public_repos=user.public_repos,
            followers=user.followers,
            following=user.following,
            total_stars=total_stars,
            top_languages=top_languages,
            most_starred=[
                {
                    "name": r.name,
                    "stars": r.stargazers_count,
                    "language": r.language,
                    "description": r.description,
                    "url": r.html_url,
                }
                for r in most_starred
            ],
            recent_activity=[
                {
                    "name": r.name,
                    "pushed_at": r.pushed_at.isoformat() if r.pushed_at else None,
                    "language": r.language,
                    "url": r.html_url,
                }
                for r in recent
            ],
            profile_url=user.html_url,
            analyzed_at=datetime.now(timezone.utc),
        )
