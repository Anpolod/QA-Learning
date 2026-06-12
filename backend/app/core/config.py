from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/qa_learning"
    jwt_secret: str = "change_me"
    ai_provider: str = "openai"
    openai_api_key: str = ""
    openrouter_api_key: str = ""
    ai_model: str = "gpt-4o-mini"
    ai_temperature: float = 0.3
    ai_max_tokens: int = 1200
    ai_daily_limit_per_user: int = 50
    ai_image_model: str = "gpt-image-1"
    ai_daily_image_limit_per_user: int = 10
    ai_daily_image_limit_admin: int = 100
    cors_origins: list[str] = ["http://localhost:3000", "https://qa.flow-ai.work"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

