import type { Request, Response } from "express";
import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";
import {
  getOrCreatePlayer,
  isValidCategory,
  isValidUsername,
  roomUpdate,
  trimString,
  uniqueRoomId,
  updatePlayer,
} from "../../utils/utils.ts";

export const createRoom = async (req: Request, res: Response) => {
  const { username, category } = req.body;

  const u = trimString(username);
  const c = trimString(category);

  if (!isValidUsername(u))
    throw new Error(
      "Invalid username. Must be 3-20 characters, no special chars.",
    );
  if (!isValidCategory(c)) throw new Error("Invalid category.");

  try {
    const player = await getOrCreatePlayer(u);

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

    if (!room) {
      console.log(`Failed to create room for ${u}`);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to create room" });
    }

    const updatedPlayer = await updatePlayer(player.id, {
      username: u,
      roomId,
      connected: true,
      score: 0,
    });

    if (!updatedPlayer) {
      console.log(`Failed to update player ${u} with room ${roomId}`);
      return { res: { ok: false, error: "Failed to join room" } };
    }

    await roomUpdate(roomId, io);

    console.log(`Room ${roomId} created by ${u}`);

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
