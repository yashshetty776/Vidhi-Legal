from datetime import datetime, timezone

from beanie import Document
from pydantic import Field


class ChatMessage(Document):
    case_id: str
    sender_username: str
    recipient_username: str
    content: str = Field(min_length=1, max_length=4000)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "chat_messages"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "case_id": self.case_id,
            "sender_username": self.sender_username,
            "recipient_username": self.recipient_username,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
        }
