import base64
from abc import ABC, abstractmethod

import httpx


class TextAIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict[str, str]], *, model: str, temperature: float, max_tokens: int, api_key: str) -> str:
        raise NotImplementedError


class OpenAIProvider(TextAIProvider):
    async def chat(self, messages: list[dict[str, str]], *, model: str, temperature: float, max_tokens: int, api_key: str) -> str:
        if not api_key:
            return "AI is configured, but the OpenAI API key is missing. Add it in Admin -> AI settings or the backend environment."
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]


class OpenRouterProvider(TextAIProvider):
    async def chat(self, messages: list[dict[str, str]], *, model: str, temperature: float, max_tokens: int, api_key: str) -> str:
        if not api_key:
            return "AI is configured, but the OpenRouter API key is missing. Add it in Admin -> AI settings or the backend environment."
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]


class OpenAIImageProvider:
    async def generate(self, prompt: str, size: str, *, model: str, api_key: str) -> bytes:
        if not api_key:
            # A tiny transparent PNG keeps the admin workflow testable without a paid key.
            return base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
            )
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": model, "prompt": prompt, "size": size},
            )
            response.raise_for_status()
            image_b64 = response.json()["data"][0]["b64_json"]
            return base64.b64decode(image_b64)


def get_text_provider(provider_name: str) -> TextAIProvider:
    if provider_name == "openrouter":
        return OpenRouterProvider()
    return OpenAIProvider()
