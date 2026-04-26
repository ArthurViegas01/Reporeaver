"""Unit tests for ProfileAnalyzer - pure-Python, no I/O, fast."""

from __future__ import annotations

from reporeaver.services.profile_analyzer import ProfileAnalyzer


def test_filters_out_forks_and_archives(sample_user, sample_repos):
    result = ProfileAnalyzer().analyze(sample_user, sample_repos)
    # legacy-fork (999) and archived (10000) should be excluded -> 1500+300+42 = 1842
    assert result.total_stars == 1842


def test_top_languages_ranked_by_repo_count(sample_user, sample_repos):
    result = ProfileAnalyzer().analyze(sample_user, sample_repos, top_languages_n=3)
    languages = [ls.language for ls in result.top_languages]
    assert languages[0] == "Python"  # 2 active python repos vs 1 typescript
    assert "TypeScript" in languages


def test_most_starred_excludes_filtered_repos(sample_user, sample_repos):
    result = ProfileAnalyzer().analyze(sample_user, sample_repos, most_starred_n=5)
    names = [r["name"] for r in result.most_starred]
    assert "hello-world" in names
    assert "archived" not in names
    assert "legacy-fork" not in names


def test_percentage_sums_to_approximately_100(sample_user, sample_repos):
    result = ProfileAnalyzer().analyze(sample_user, sample_repos, top_languages_n=10)
    total_pct = sum(ls.percentage for ls in result.top_languages)
    assert 99.0 <= total_pct <= 100.5
