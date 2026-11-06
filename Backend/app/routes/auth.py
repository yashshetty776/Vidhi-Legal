from datetime import timedelta

from fastapi import APIRouter, Form, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.database import init_db
from app.models.user import User
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter()


class RegisterUser(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=3, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    password: str = Field(min_length=8, max_length=72)
    role: str
    experience: int | None = Field(default=None, ge=0, le=80)
    location: str = Field(min_length=2, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not any(character.islower() for character in value):
            raise ValueError("Password must contain a lowercase letter")
        if not any(character.isupper() for character in value):
            raise ValueError("Password must contain an uppercase letter")
        if not any(not character.isalnum() for character in value):
            raise ValueError("Password must contain a special character")
        return value

    @field_validator("location")
    @classmethod
    def validate_location(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Location is required")
        return value

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        normalized = value.lower()
        if normalized not in {"client", "lawyer"}:
            raise ValueError("Role must be either client or lawyer")
        return normalized

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if len(value.split()) < 2:
            raise ValueError("Enter your first and last name")
        return value


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: RegisterUser):
    await init_db()
    username = user_data.username.lower()
    existing_user = await User.find_one(User.username == username)
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already registered")

    user = User(
        full_name=user_data.full_name,
        username=username,
        password=hash_password(user_data.password),
        role=user_data.role,
        experience=user_data.experience if user_data.role == "lawyer" else None,
        location=user_data.location,
    )
    await user.insert()

    token = create_access_token(
        {"sub": user.username, "user_id": str(user.id), "role": user.role}
    )
    return JSONResponse(status_code=201, content={"token": token})


@router.post("/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    normalized_username = username.strip().lower()
    if not normalized_username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    await init_db()
    user = await User.find_one(User.username == normalized_username)
    if user is None or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=30),
    )
    return {"access_token": access_token, "token_type": "bearer"}
