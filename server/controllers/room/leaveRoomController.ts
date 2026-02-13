import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import { io } from "../../index.ts";
import { roomUpdate, trimString, updatePlayer } from "../../utils/utils.ts";

export const leaveRoomController = async (req: Request, res: Response) => {
  const { playerId, roomId } = req.body ?? {};
  const r = trimString(roomId);
  const pid = trimString(playerId);

  if (!pid) {
    return res.status(400).json({ ok: false, error: "Player ID required" });
  }

  if (!r) {
    return res.status(400).json({ ok: false, error: "Invalid room ID" });
  }

  try {
    const player = await prisma.player.findUnique({ where: { id: pid } });
    if (!player) {
      return res.status(401).json({ ok: false, error: "Player not found" });
    }

    const room = await prisma.room.findUnique({ where: { id: r } });
    if (!room) {
      return res.status(404).json({ ok: false, error: "Room not found" });
    }

    const isHost = room.hostId === player.id;

    if (isHost) {
        io.to(r).emit("room:closed", { message: "Host left, room closed" });
        io.in(r).socketsLeave(r);

        await prisma.player.updateMany({
            where: { roomId: r, connected: true },
            data: { roomId: null, connected: false },
        });

        console.log(`Host left, room ${r} (room kept in DB)`);
        return res.status(200).json({ ok: true, roomId: r, closed: true });
    }

    await updatePlayer(pid, { roomId: null, connected: false });
    io.emit("room:leave", { message: "Player left room", status:"leaved" });
    await roomUpdate(r, io);

    console.log(`Player ${player.username} left room ${r}`);
    return res.status(200).json({ ok: true, roomId: r });
  } catch (error) {
    console.error("Error leaving room:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};