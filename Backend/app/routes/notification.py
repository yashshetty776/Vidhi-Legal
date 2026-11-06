from datetime import datetime, timezone
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import init_db
from app.models.notification import Notification
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter()


async def create_notification(
    recipient: str,
    message: str,
    case_id: str | None,
    notification_type: str,
) -> None:
    await init_db()
    await Notification(
        recipient=recipient,
        message=message,
        case_id=case_id,
        notification_type=notification_type,
        timestamp=datetime.now(timezone.utc),
        read=False,
    ).insert()


@router.get("/notifications", response_model=List[dict])
async def get_notifications(
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
):
    await init_db()
    query = Notification.find(Notification.recipient == current_user.username)
    if unread_only:
        query = query.find(Notification.read == False)  # noqa: E712
    notifications = await query.sort("-timestamp").to_list()
    return [notification.to_dict() for notification in notifications]


@router.put("/notifications/{notification_id}/read", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    await init_db()
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    notification = await Notification.get(notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.recipient != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    notification.read = True
    await notification.save()
    return {"message": "Notification marked as read", "notification": notification.to_dict()}
