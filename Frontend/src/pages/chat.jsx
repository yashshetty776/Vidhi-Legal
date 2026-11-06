import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL, WS_BASE_URL } from "../config";

const ChatApp = () => {
  const { caseId } = useParams();
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!caseId) {
      setError("A case is required.");
      setStatus("Unavailable");
      return undefined;
    }

    axios.get(`${API_BASE_URL}/users/profile/me`)
      .then((response) => setUsername(response.data.username))
      .catch(() => setError("Unable to load your session."));
    const socket = new WebSocket(`${WS_BASE_URL}/ws/cases/${caseId}`);
    let active = true;
    socketRef.current = socket;

    socket.onopen = () => {
      if (!active || socketRef.current !== socket) return;
      setStatus("Connected");
      setError("");
    };

    socket.onmessage = (event) => {
      if (!active || socketRef.current !== socket) return;
      const data = JSON.parse(event.data);
      if (data.type === "error") {
        setError(data.message);
        return;
      }
      setMessages((previous) => [
        ...previous,
        {
          id: data.id,
          sender: data.sender_username,
          content: data.content,
          createdAt: data.created_at,
        },
      ]);
    };

    socket.onerror = () => {
      if (!active || socketRef.current !== socket) return;
      setStatus("Connection error");
      setError("Could not connect to the chat server.");
    };

    socket.onclose = (event) => {
      if (!active || socketRef.current !== socket) return;
      socketRef.current = null;
      setStatus("Disconnected");
      if (event.reason) {
        setError(event.reason);
      }
    };

    return () => {
      active = false;
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        socket.close(1000, "Chat view closed");
      }
    };
  }, [caseId]);

  const sendMessage = () => {
    const content = message.trim();
    const socket = socketRef.current;
    if (!content) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const state = socket
        ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState]
        : "MISSING";
      setError(`Chat is not ready (socket state: ${state}).`);
      return;
    }

    socket.send(JSON.stringify({ content }));
    setMessage("");
    setError("");
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", marginTop: 20 }}>
        <h1>Case Chat</h1>
        <p>Status: {status}</p>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "400px",
            overflowY: "scroll",
            marginBottom: "10px",
          }}
        >
          {messages.map((item, index) => (
            <p
              key={item.id || `${item.createdAt}-${index}`}
              style={{
                textAlign: item.sender === username ? "right" : "left",
                margin: "5px 0",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: item.sender === username ? "#d1e7dd" : "#f8d7da",
                color: item.sender === username ? "#0f5132" : "#842029",
                wordWrap: "break-word",
              }}
            >
              <strong>{item.sender}:</strong> {item.content}
            </p>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") sendMessage();
          }}
          placeholder="Type your message"
          style={{
            width: "80%",
            padding: "10px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={status !== "Connected"}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
