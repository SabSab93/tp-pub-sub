import http from "http";
import path from "path";
import express from "express";
import { ChatSocket } from "./chat/chat.socket";
import { WhoAmIController } from "./api/whoami.controller";
import { ChatController } from "./api/chat.controller";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const server = http.createServer(app);

// WebSocket (singleton)
ChatSocket.INSTANCE.setup(server);

// Front (optionnel) – s'il existe un build Vue/Angular/React à servir
// Attention : après build TS, __dirname pointe vers 'dist'
const frontDist = path.join(__dirname, "../front/dist");
app.use(express.static(frontDist));

// Middlewares
app.use(express.json());

// Routes API
app.get("/api/whoami", WhoAmIController.get);
app.post("/api/chat", ChatController.post);

// Écoute HTTP + WS
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});