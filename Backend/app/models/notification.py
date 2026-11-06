from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class Notification(Document):
    recipient: str
    message: str = Field(min_length=1, max_length=500)
    case_id: Optional[str] = None
    notification_type: str = Field(min_length=1, max_length=50)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

    class Settings:
        name = "notifications"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "recipient": self.recipient,
            "message": self.message,
            "case_id": self.case_id,
            "notification_type": self.notification_type,
            "timestamp": self.timestamp.isoformat(),
            "read": self.read,
        }
