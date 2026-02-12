import type { NextFunction, Response, Request } from "express";
import { prisma } from "../../lib/prisma.ts";
import { io } from "../../index.ts";

export const postMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, senderId } = req.params;
    const { message } = req.body;

    if (!id || Array.isArray(id) || !senderId || Array.isArray(senderId)) {
      return res.status(400).json({ error: "Invalid room id or sender id" });
    }

    const room = await prisma.room.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const uploadedMessage = await prisma.message.create({
      data: {
        content: message,
        roomId: id,
        senderId: senderId,
      },
    });

    res.status(200).json(uploadedMessage);

    io.to(id).emit("newMessage", uploadedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to post message" });
    next(error);
  }
};
