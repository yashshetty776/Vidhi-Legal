from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import init_db
from app.models.case import Case
from app.models.user import User
from app.schemas.user import UserUpdate
from app.services.auth_service import get_current_user

router = APIRouter()


async def apply_profile_update(user: User, update_data: UserUpdate) -> User:
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.experience is not None:
        user.experience = update_data.experience if user.role == "lawyer" else None
    if update_data.location is not None:
        user.location = update_data.location

    await user.save()
    return user


@router.get("/profile/me", response_model=dict)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user.to_dict()


@router.put("/profile/me", response_model=dict)
async def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    updated_user = await apply_profile_update(current_user, update_data)
    return updated_user.to_dict()


@router.delete("/profile/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_profile(current_user: User = Depends(get_current_user)):
    await current_user.delete()


@router.get("/profile/{username}", response_model=dict)
async def get_user_profile(
    username: str,
    current_user: User = Depends(get_current_user),
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Access denied")
    return current_user.to_dict()


@router.put("/profile/{username}", response_model=dict)
async def update_user_profile(
    username: str,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Access denied")
    updated_user = await apply_profile_update(current_user, update_data)
    return updated_user.to_dict()


@router.delete("/profile/{username}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    username: str,
    current_user: User = Depends(get_current_user),
):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Access denied")
    await current_user.delete()


@router.get("/lawyers", response_model=List[dict])
async def get_all_lawyers(current_user: User = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can view the lawyer directory",
        )

    lawyers = await User.find(User.role == "lawyer").to_list()
    return [lawyer.to_dict() for lawyer in lawyers]


@router.get("/user_cases/{username}", response_model=List[dict])
async def user_cases(
    username: str,
    current_user: User = Depends(get_current_user),
):
    if username != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == "client":
        cases = await Case.find(Case.client_username == username).to_list()
    elif current_user.role == "lawyer":
        cases = await Case.find(Case.lawyer_username == username).to_list()
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    return [case.to_dict() for case in cases]
