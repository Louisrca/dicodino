import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import { io } from "../../index.ts";
import type { JwtPayload } from "../../auth/jwt.ts";
import {
  formalizeUsername,
  MAX_PLAYERS,
  roomUpdate,
  trimString,
  updatePlayer,
} from "../../utils/utils.ts";

export const joinRoomController = async (req: Request, res: Response) => {
  const { playerId } = (req as Request & { jwtPlayer: JwtPayload }).jwtPlayer;
  const { roomId } = req.body;
  const r = trimString(roomId);

  if (!r) {
    return res.status(400).json({ ok: false, error: "Invalid room ID" });
  }

  try {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(401).json({ ok: false, error: "Joueur introuvable" });
    }

    const room = await prisma.room.findUnique({
      where: { id: r },
      include: { players: { where: { connected: true } } },
    });

    if (!room) {
      return res.status(404).json({ ok: false, error: "Room not found" });
    }

    if (room.players.length >= MAX_PLAYERS) {
      return res.status(400).json({ ok: false, error: "Room is full" });
    }

    const usernameTaken = room.players.some(
      (p) => formalizeUsername(p.username) === formalizeUsername(player.username),
    );
    if (usernameTaken) {
      return res
        .status(400)
        .json({ ok: false, error: "Username already taken" });
    }

    if (player.connected && player.roomId && player.roomId !== r) {
      return res.status(400).json({
        ok: false,
        error: "Player already in another room",
      });
    }

    const updatedPlayer = await updatePlayer(player.id, {
      roomId: r,
      connected: true,
      score: 0,
    });

    if (!updatedPlayer) {
      return res.status(500).json({ ok: false, error: "Failed to join room" });
    }

    await roomUpdate(r, io);

    console.log(`${player.username} joined room ${r}`);

    res.status(200).json({
      ok: true,
      roomId: r,
      player: { id: player.id, username: player.username },
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
