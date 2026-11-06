from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CaseStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    closed = "closed"


class CaseCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=20, max_length=10000)
    category: str = Field(min_length=2, max_length=80)


class CaseUpdate(BaseModel):
    status: CaseStatus
