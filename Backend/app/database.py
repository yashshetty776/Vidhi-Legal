from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie # type: ignore
from app.models.user import User
from app.models.case import Case
# from models.message import Message 
from app.models.notification import Notification
from app.models.message import ChatMessage
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).with_name(".env.local"))

# Get MongoDB URL
MONGO_URI = os.getenv("MONGO_URI")
async def init_db():
    client = AsyncIOMotorClient(MONGO_URI)
    database = client.get_database("Legal")  # Explicitly use the "main" database
    await init_beanie(
        database,
        document_models=[User, Case, Notification, ChatMessage],
    )