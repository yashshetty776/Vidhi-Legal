from collections import defaultdict
from typing import DefaultDict

from fastapi import WebSocket, WebSocketDisconnect


class ChatConnectionManager:
    def __init__(self) -> None:
        self._connections: DefaultDict[str, dict[str, set[WebSocket]]] = defaultdict(
            lambda: defaultdict(set)
        )

    async def connect(
        self,
        case_id: str,
        username: str,
        websocket: WebSocket,
        subprotocol: str = "bearer",
    ) -> None:
        await websocket.accept(subprotocol=subprotocol)
        self._connections[case_id][username].add(websocket)

    def disconnect(self, case_id: str, username: str, websocket: WebSocket) -> None:
        case_connections = self._connections.get(case_id)
        if not case_connections:
            return

        user_connections = case_connections.get(username)
        if user_connections:
            user_connections.discard(websocket)
            if not user_connections:
                del case_connections[username]

        if not case_connections:
            del self._connections[case_id]

    async def send_to_case(
        self,
        case_id: str,
        participants: tuple[str, str],
        message: dict,
    ) -> None:
        case_connections = self._connections.get(case_id)
        if not case_connections:
            return

        for participant in participants:
            for websocket in tuple(case_connections.get(participant, ())):
                try:
                    await websocket.send_json(message)
                except (WebSocketDisconnect, RuntimeError):
                    self.disconnect(case_id, participant, websocket)
