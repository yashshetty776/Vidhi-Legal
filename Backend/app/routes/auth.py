from datetime import timedelta

from fastapi import APIRouter, Form, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi import Response
from app.database import init_db
from app.config import ALLOW_PUBLIC_LAWYER_REGISTRATION
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES, COOKIE_SECURE
from app.models.user import User
from app.schemas.auth import RegisterUser
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: RegisterUser):
    await init_db()
    if user_data.role == "lawyer" and not ALLOW_PUBLIC_LAWYER_REGISTRATION:
        raise HTTPException(
            status_code=403,
            detail="Lawyer accounts require administrator approval",
        )
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
    response = JSONResponse(status_code=201, content={"message": "Registration successful"})
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return response


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
    response = JSONResponse({"message": "Login successful"})
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return response


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie("access_token")
