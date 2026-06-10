"""
Centralised configuration via Pydantic Settings.

All secrets come from environment variables. The app refuses to start if any
required secret is missing - fail-fast over silent misconfig.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, RedisDsn, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    environment: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    deploy_region: str = "local"

    # Server
    mcp_host: str = "0.0.0.0"  # noqa: S104
    mcp_port: int = 8000

    # Integrations
    github_token: SecretStr = Field(..., description="GitHub PAT")
    github_api_base: str = "https://api.github.com"

    groq_api_key: SecretStr = Field(..., description="Groq API key")
    groq_model: str = "llama-3.3-70b-versatile"

    # Redis
    redis_url: RedisDsn = Field(..., description="Redis connection URL")
    cache_ttl_seconds: int = 3600

    # Rate limiting
    rate_limit_per_minute: int = 30
    trusted_proxy_depth: int = Field(
        1,
        description=(
            "Number of trusted reverse proxy hops in X-Forwarded-For. "
            "Set to 1 when behind Railway or any single load balancer."
        ),
    )

    # CORS
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, v: object) -> object:
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
