from typing import Optional

from beanie import Document
from pydantic import BaseModel, ConfigDict, Field, field_validator


class User(Document):
    full_name: str
    username: str
    password: str
    role: str
    experience: Optional[int] = None
    location: Optional[str] = None

    class Settings:
        collection = "users"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "full_name": self.full_name,
            "username": self.username,
            "role": self.role,
            "experience": self.experience,
            "location": self.location,
        }


class UserUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: Optional[str] = Field(default=None, min_length=3, max_length=100)
    experience: Optional[int] = Field(default=None, ge=0, le=80)
    location: Optional[str] = Field(default=None, min_length=2, max_length=100)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if len(value.split()) < 2:
            raise ValueError("Enter your first and last name")
        return value

    @field_validator("location")
    @classmethod
    def validate_location(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Location is required")
        return value
