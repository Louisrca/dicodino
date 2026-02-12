import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";

export const getUserInformation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const user = await prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        socketId: true,
        roomId: true,
        connected: true,
        score: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
