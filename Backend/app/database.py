from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie # type: ignore
from models.user import User
from models.case import Case
# from models.message import Message 
from models.notification import Notification
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="config/.env")

# Get MongoDB URL
MONGO_URI = os.getenv("MONGO_URI")
async def init_db():
    client = AsyncIOMotorClient(MONGO_URI)
    database = client.get_database("Legal")  # Explicitly use the "main" database
    await init_beanie(database, document_models=[User, Case, Notification])  # Register user model