"""Tests for GitHub username validation in analyze_profile tool."""

from __future__ import annotations

import pytest

from devscope.tools.analyze_profile import _validate_username


@pytest.mark.parametrize(
    "username",
    [
        "octocat",
        "John-Doe",
        "user123",
        "a",
        "A1",
        "a-b",
        "a" * 39,
    ],
)
def test_valid_usernames(username: str):
    assert _validate_username(username) == username


@pytest.mark.parametrize(
    "username",
    [
        "",
        "   ",
        "-starts-with-hyphen",
        "ends-with-hyphen-",
        "has spaces",
        "has_underscore",
        "has.dot",
        "a" * 40,
        "../etc/passwd",
        "user\x00name",
    ],
)
def test_invalid_usernames(username: str):
    with pytest.raises(ValueError):
        _validate_username(username)


def test_strips_whitespace():
    assert _validate_username("  octocat  ") == "octocat"


def test_empty_after_strip():
    with pytest.raises(ValueError, match="must not be empty"):
        _validate_username("   ")
