import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" }
});

export async function sendChatMessage(message) {
  return api.post("/api/chat", { message });
}

export async function fetchWhoAmI() {
  const { data } = await api.get("/api/whoami");
  return data; // { ip: string[] }
}
