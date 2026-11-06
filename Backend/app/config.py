import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, Field, field_validator

load_dotenv(dotenv_path=Path(__file__).with_name(".env.local"))


class Settings(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    secret_key: str = Field(min_length=32)
    mongo_uri: str = Field(min_length=1)
    database_name: str = Field(default="Legal", min_length=1, max_length=63)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, ge=1, le=1440)
    allow_public_lawyer_registration: bool = False
    cors_origins: list[str] = Field(min_length=1)

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, value: str) -> str:
        if value not in {"HS256", "HS384", "HS512"}:
            raise ValueError("ALGORITHM must be HS256, HS384, or HS512")
        return value

    @field_validator("cors_origins")
    @classmethod
    def validate_cors_origins(cls, value: list[str]) -> list[str]:
        origins = [origin.strip().rstrip("/") for origin in value if origin.strip()]
        if not origins or "*" in origins:
            raise ValueError("CORS_ORIGINS must contain explicit origins")
        return origins


def _environment_settings() -> Settings:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    return Settings(
        secret_key=os.getenv("SECRET_KEY"),
        mongo_uri=os.getenv("MONGO_URI"),
        database_name=os.getenv("DATABASE_NAME", "Legal"),
        algorithm=os.getenv("ALGORITHM", "HS256"),
        access_token_expire_minutes=os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"),
        allow_public_lawyer_registration=os.getenv(
            "ALLOW_PUBLIC_LAWYER_REGISTRATION", "false"
        ),
        cors_origins=raw_origins,
    )


settings = _environment_settings()

SECRET_KEY = settings.secret_key
MONGO_URI = settings.mongo_uri
DATABASE_NAME = settings.database_name
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
ALLOW_PUBLIC_LAWYER_REGISTRATION = settings.allow_public_lawyer_registration
ALLOWED_ORIGINS = settings.cors_origins
