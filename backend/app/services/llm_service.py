from __future__ import annotations

import os
import json
import httpx
from fastapi import HTTPException


class LLMService:
    """Service for calling different LLM providers."""

    async def ask(self, question: str) -> dict:
        """Return answer and explanation for a flashcard question."""
        provider = os.getenv("LLM_PROVIDER", "openai").lower()
        if provider == "deepseek":
            return await self._call_deepseek(question)
        return await self._call_openai(question)

    def _messages(self, question: str) -> list[dict]:
        prompt = os.getenv(
            "LLM_SYSTEM_PROMPT",
            "You are a helpful assistant that answers questions for a flashcard. Respond in JSON with 'answer' and 'explanation' fields.",
        )
        return [
            {"role": "system", "content": prompt},
            {"role": "user", "content": question},
        ]

    async def _call_openai(self, question: str) -> dict:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        messages = self._messages(question)
        payload = {"model": "gpt-3.5-turbo", "messages": messages}
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            try:
                return json.loads(content)
            except Exception:
                return {"answer": content, "explanation": ""}

    async def _call_deepseek(self, question: str) -> dict:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="DeepSeek API key not configured")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        messages = self._messages(question)
        payload = {"model": "deepseek-chat", "messages": messages}
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            try:
                return json.loads(content)
            except Exception:
                return {"answer": content, "explanation": ""}


# Default service instance used by the application
llm_service = LLMService()
