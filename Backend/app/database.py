import asyncio
import os
from pathlib import Path

from beanie import init_beanie  # type: ignore
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from app.models.case import Case
from app.models.message import ChatMessage
from app.models.notification import Notification
from app.models.user import User

load_dotenv(dotenv_path=Path(__file__).with_name(".env.local"))

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured")

_client = AsyncIOMotorClient(MONGO_URI)
_database = _client.get_database("Legal")
_initialization_lock = asyncio.Lock()
_initialized = False


async def init_db() -> None:
    global _initialized
    if _initialized:
        return

    async with _initialization_lock:
        if _initialized:
            return
        await init_beanie(
            _database,
            document_models=[User, Case, Notification, ChatMessage],
        )
        _initialized = True
