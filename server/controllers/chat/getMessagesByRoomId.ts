import type { NextFunction, Response, Request } from "express";
import { prisma } from "../../lib/prisma.ts";

export const getMessageByRoomId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: id },
      include: { sender: true },
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
