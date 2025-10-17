import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export class ChatSocket {
  // --- DP Singleton ---
  public static readonly INSTANCE = new ChatSocket();

  // Événements I/O
  public static readonly OUT = "message";
  public static readonly IN = "message";

  // À restreindre en prod (mettre ton domaine)
  public static readonly CORS = { origin: "*" as const };

  private io?: Server;

  private constructor() {}

  setup(httpServer: HttpServer) {
    this.io = new Server(httpServer, { cors: ChatSocket.CORS });
    this.io.on("connection", (socket: Socket) => this.onConnected(socket));
  }

  send(message: string) {
    if (!this.io) {
      console.warn("[ChatSocket] io non initialisé");
      return;
    }
    console.log(`>> ${message}`);
    this.io.emit(ChatSocket.OUT, message);
  }

  // --- Handlers privés ---
  private onConnected(socket: Socket) {
    console.log(`Client ${socket.id} connecté`);
    socket.emit(ChatSocket.OUT, "Bienvenue !");

    socket.on(ChatSocket.IN, (message: string) => this.onMessage(socket, message));
    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} déconnecté : ${reason}`);
    });
  }

  private onMessage(socket: Socket, message: string) {
    console.log(`[${socket.id}] Message reçu :`, message);
    // Echo
    socket.emit("echo", `echo: ${message}`);
  }
}