const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = configuredApiUrl.replace(/\/$/, "");
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export const authHeaders = (token = localStorage.getItem("token")) => ({
  Authorization: `Bearer ${token}`,
});
