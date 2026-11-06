from json import JSONDecodeError

from bson import ObjectId
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field, ValidationError

from app.database import init_db
from app.config import ALLOWED_ORIGINS
from app.models.case import Case
from app.models.message import ChatMessage
from app.services.auth_service import get_username_from_token
from app.services.chat_service import ChatConnectionManager

router = APIRouter()
connection_manager = ChatConnectionManager()


class ChatMessageInput(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


async def close_connection(websocket: WebSocket, reason: str) -> None:
    await websocket.close(code=1008, reason=reason)


def get_websocket_token(websocket: WebSocket) -> str | None:
    protocols = [
        protocol.strip()
        for protocol in websocket.headers.get("sec-websocket-protocol", "").split(",")
    ]
    if len(protocols) == 2 and protocols[0] == "bearer":
        return protocols[1]
    return None


@router.websocket("/ws/cases/{case_id}")
async def case_chat(websocket: WebSocket, case_id: str) -> None:
    await init_db()

    origin = websocket.headers.get("origin")
    if origin not in ALLOWED_ORIGINS:
        await close_connection(websocket, "Origin not allowed")
        return

    if not ObjectId.is_valid(case_id):
        await close_connection(websocket, "Invalid case ID")
        return

    token = websocket.cookies.get("access_token") or get_websocket_token(websocket)
    username = get_username_from_token(token)
    if username is None:
        await close_connection(websocket, "Authentication required")
        return

    case = await Case.get(case_id)
    if case is None:
        await close_connection(websocket, "Case not found")
        return

    lawyer_username = case.lawyer_username
    if lawyer_username is None or username not in (
        case.client_username,
        lawyer_username,
    ):
        await close_connection(websocket, "Chat access denied")
        return

    await connection_manager.connect(case_id, username, websocket, "bearer")
    try:
        previous_messages = (
            await ChatMessage.find(ChatMessage.case_id == case_id)
            .sort("+created_at")
            .to_list()
        )
        for previous_message in previous_messages:
            await websocket.send_json(previous_message.to_dict())

        while True:
            try:
                payload = ChatMessageInput.model_validate(await websocket.receive_json())
            except (JSONDecodeError, ValidationError):
                await websocket.send_json(
                    {"type": "error", "message": "Message content is invalid"}
                )
                continue

            recipient = (
                lawyer_username
                if username == case.client_username
                else case.client_username
            )
            chat_message = ChatMessage(
                case_id=case_id,
                sender_username=username,
                recipient_username=recipient,
                content=payload.content.strip(),
            )
            if not chat_message.content:
                await websocket.send_json(
                    {"type": "error", "message": "Message content is required"}
                )
                continue

            await chat_message.insert()
            await connection_manager.send_to_case(
                case_id,
                (case.client_username, lawyer_username),
                chat_message.to_dict(),
            )
    except WebSocketDisconnect:
        pass
    finally:
        connection_manager.disconnect(case_id, username, websocket)
