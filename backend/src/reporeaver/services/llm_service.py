"""
LLM service - wraps Groq + LangChain.

Two execution modes:
  - astream(prompt)  : token-by-token async generator (used for the recruiter
                       summary so the MCP client can render it incrementally)
  - acomplete(prompt): single-shot completion (used by map_to_job)
"""
from __future__ import annotations

from collections.abc import AsyncIterator

from groq import AsyncGroq
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from reporeaver.config import Settings


class LLMService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._groq = AsyncGroq(api_key=settings.groq_api_key.get_secret_value())
        self._chat = ChatGroq(
            api_key=settings.groq_api_key.get_secret_value(),
            model=settings.groq_model,
            temperature=0.3,
        )

    async def astream(
        self, system: str, user: str, *, temperature: float = 0.4
    ) -> AsyncIterator[str]:
        """Token-by-token streaming via the raw Groq async client."""
        stream = await self._groq.chat.completions.create(
            model=self._settings.groq_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            stream=True,
        )
        async for chunk in stream:
            content = chunk.choices[0].delta.content if chunk.choices else None
            if content:
                yield content

    async def map_to_job_structured(
        self, profile_summary: str, job_description: str
    ) -> dict:
        """
        Use LangChain to produce a structured JSON match.

        Returns a dict matching the JobMatchResult shape (caller validates).
        """
        parser = JsonOutputParser()
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a senior tech recruiter assistant. Given a developer's "
                    "profile and a job description, produce a strictly valid JSON object "
                    "with these keys: matched_skills (list of strings), missing_skills "
                    "(list of strings), strengths (list of short bullets), gaps (list of "
                    "short bullets), overall_match_score (integer 0-100), summary (3-5 "
                    "sentences). Output JSON only, no markdown fences.",
                ),
                (
                    "user",
                    "DEVELOPER PROFILE:\n{profile}\n\nJOB DESCRIPTION:\n{job}",
                ),
            ]
        )
        chain = prompt | self._chat | parser
        result = await chain.ainvoke({"profile": profile_summary, "job": job_description})
        return result if isinstance(result, dict) else {}
