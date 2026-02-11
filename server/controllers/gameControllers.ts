import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

import { io } from "../index.ts";

export const sendMessage = async (
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
    next(error);
  }
};

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

export const getUserInformationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const user = await prisma.player.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
