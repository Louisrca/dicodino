import type { Request, Response } from "express";
import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";
import type { JwtPayload } from "../../auth/jwt.ts";
import {
  isValidCategory,
  roomUpdate,
  trimString,
  uniqueRoomId,
  updatePlayer,
} from "../../utils/utils.ts";

export const createRoom = async (req: Request, res: Response) => {
  const { playerId } = (req as Request & { jwtPlayer: JwtPayload }).jwtPlayer;
  const { category } = req.body;
  const c = trimString(category);

  if (!isValidCategory(c)) throw new Error("Invalid category.");

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(401).json({ ok: false, error: "Joueur introuvable" });
    }

    if (player.connected && player.roomId) {
      return res.status(400).json({
        ok: false,
        error:
          "Username already in use in another room. Please choose another.",
      });
    }

    const roomId = await uniqueRoomId();
    const room = await prisma.room.create({
      data: { id: roomId, category: c, hostId: player.id },
    });

    const isUserAlreadyInRoom = await prisma.player.findFirst({
      where: { username: player.username, roomId: roomId, connected: true },
    });

    if (isUserAlreadyInRoom) {
      return res.status(400).json({
        ok: false,
        error: "Username already in use in this room. Please choose another.",
      });
    }

    if (!room) {
      console.log(`Failed to create room for ${player.username}`);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to create room" });
    }

    const updatedPlayer = await updatePlayer(player.id, {
      roomId,
      connected: true,
      score: 0,
    });

    if (!updatedPlayer) {
      console.log(`Failed to update player ${player.username} with room ${roomId}`);
      return res.status(500).json({ ok: false, error: "Failed to join room" });
    }

    await roomUpdate(roomId, io);

    console.log(`Room ${roomId} created by ${player.username}`);

    res.status(201).json({
      ok: true,
      room: { id: room.id, category: room.category, hostId: room.hostId },
      player: { id: player.id, username: player.username },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
