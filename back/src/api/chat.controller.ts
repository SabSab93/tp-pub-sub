import { Request, Response } from "express";
import { ChatSocket } from "../chat/chat.socket";

type ChatBody = { message?: string };

export class ChatController {
  static post(req: Request<unknown, unknown, ChatBody>, res: Response) {
    console.log(req.body);

    const msg = (req.body?.message ?? "").trim();
    if (!msg) {
      return res.status(400).json({ error: "Champ 'message' requis" });
    }

    ChatSocket.INSTANCE.send(msg);
    res.status(200).send();
  }
}