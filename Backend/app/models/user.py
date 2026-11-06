from typing import Optional

from beanie import Document


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
