from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field

from app.schemas.case import CaseStatus


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
