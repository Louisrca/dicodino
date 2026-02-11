import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.ts";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uuidRoom = uuidv4();
  const uuidPlayer = uuidv4();

  try {
    const { name } = req.body;

    const room = await prisma.room.create({
      data: {
        id: uuidRoom,
        host: name,
        category: "",
        createdAt: new Date(),
        players: {
          create: {
            id: uuidPlayer,
            username: name,
            connected: true,
            score: 0,
          },
        },
      },
      include: {
        players: true,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};
