const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = configuredApiUrl.replace(/\/$/, "");
export const requestConfig = { withCredentials: true };
axios.defaults.withCredentials = true;

const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  API_BASE_URL
);

if (import.meta.env.PROD && !API_BASE_URL.startsWith("https://")) {
  throw new Error("VITE_API_BASE_URL must use HTTPS in production.");
}

if (!isLocalUrl && !API_BASE_URL.startsWith("https://")) {
  throw new Error("Non-local API endpoints must use HTTPS.");
}

export const WS_BASE_URL = API_BASE_URL
  .replace(/^https:\/\//i, "wss://")
  .replace(/^http:\/\//i, "ws://");
import axios from "axios";
