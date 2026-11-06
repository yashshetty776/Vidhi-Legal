from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CaseStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"


class Case(Document):
    title: str
    description: str
    category: str
    client_username: str
    lawyer_username: Optional[str] = None
    status: CaseStatus = CaseStatus.pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "cases"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "client_username": self.client_username,
            "lawyer_username": self.lawyer_username,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
        }


class CaseCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=20, max_length=10000)
    category: str = Field(min_length=2, max_length=80)


class CaseUpdate(BaseModel):
    status: CaseStatus
