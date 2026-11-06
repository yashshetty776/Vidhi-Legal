import asyncio
from beanie import init_beanie  # type: ignore
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import DATABASE_NAME, MONGO_URI
from app.models.case import Case
from app.models.message import ChatMessage
from app.models.notification import Notification
from app.models.user import User

_client = AsyncIOMotorClient(MONGO_URI)
_database = _client.get_database(DATABASE_NAME)
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
