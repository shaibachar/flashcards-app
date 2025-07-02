from __future__ import annotations

import os
import json
import httpx
from fastapi import HTTPException
from typing import List


class LLMService:
    """Service for calling different LLM providers."""

    def _transform_messages(self, question: str) -> list[dict]:
        prompt = os.getenv(
            "QUESTION_TRANSFORM_PROMPT",
            "You are a \"Question Transformer\" that makes any question fascinating.  \n\n**Rules:**  \n1. **Identify the core idea** (even if vague).  \n2. **Add intrigue** using:  \n   - A surprising analogy  \n   - A \"What if?\" scenario  \n   - A relatable human struggle  \n3. **Output format:**  \n   - **Original:** [Boring question]  \n   - **Transformed:** [Engaging version]  \n   - **Why it works:** [1-sentence explanation]  \n\n**Example:**  \nOriginal: \"How do batteries work?\"  \nTransformed: \"What if your phone could run on a tiny lightning storm?\"  \nWhy it works: *Replaces technical details with a vivid, magical analogy.*  \n\n**Now transform this question:**",
        )
        return [
            {"role": "system", "content": prompt},
            {"role": "user", "content": question},
        ]

    async def transform_question(self, question: str) -> str:
        """Return an engaging version of the question."""
        provider = os.getenv("LLM_PROVIDER", "openai").lower()
        messages = self._transform_messages(question)
        if provider == "deepseek":
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="DeepSeek API key not configured")
            url = "https://api.deepseek.com/v1/chat/completions"
            model = "deepseek-chat"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        else:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            url = "https://api.openai.com/v1/chat/completions"
            model = "gpt-3.5-turbo"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {"model": model, "messages": messages}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"].strip()
        for line in text.splitlines():
            if line.lower().startswith("transformed:"):
                return line.split(":", 1)[1].strip()
        return question

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

    def _chat_sync(self, messages: List[dict]) -> str:
        provider = os.getenv("LLM_PROVIDER", "openai").lower()
        if provider == "deepseek":
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="DeepSeek API key not configured")
            url = "https://api.deepseek.com/v1/chat/completions"
            model = "deepseek-chat"
            key = api_key
        else:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            url = "https://api.openai.com/v1/chat/completions"
            model = "gpt-3.5-turbo"
            key = api_key
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        payload = {"model": model, "messages": messages}
        resp = httpx.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    def coverage(self, subject: str, questions: List[str]) -> float:
        """Return estimated coverage percentage for ``subject``."""
        prompt = (
            f"Estimate the coverage in percent of the subject '{subject}' represented by the following questions. "
            "Respond in JSON with a 'coverage' field containing the percentage as a number."
        )
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "\n".join(questions)},
        ]
        try:
            content = self._chat_sync(messages)
            data = json.loads(content)
            return float(data.get("coverage", 0.0))
        except Exception:
            return 0.0


# Default service instance used by the application
llm_service = LLMService()
