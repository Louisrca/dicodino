import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";

export const getLobbyInformationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid room id" });
    }

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        players: {
          where: { connected: true },
          select: {
            id: true,
            username: true,
            socketId: true,
            roomId: true,
            connected: true,
            score: true,
          },
        },
        host: true,
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Retourner les données formatées correctement
    res.status(200).json({
      id: room.id,
      category: room.category,
      players: room.players,
      hostId: room.hostId,
      host: room.host,
    });
  } catch (error) {
    next(error);
  }
};