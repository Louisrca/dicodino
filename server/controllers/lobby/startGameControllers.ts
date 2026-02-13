import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";
import { randomDefinition } from "../../utils/utils.ts";
import type { Request, Response } from "express";

/** Démarre la partie : crée un seul round (round 1) et envoie la définition. */
export const StartGameControllers = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    io.emit("room:error", { message: "Room ID is required" });
    return res.status(400).end();
  }

  const roomSocket = io.sockets.adapter.rooms.get(id);
  if (!roomSocket) {
    io.emit("room:error", { message: "Room not found" });
    return res.status(404).end();
  }

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    io.emit("room:error", { message: "Room not found" });
    return res.status(404).end();
  }

  // Éviter de créer plusieurs rounds au cas où le client rappellerait l’API
  const existingRound = await prisma.round.findFirst({
    where: { roomId: id },
    orderBy: { roundNumber: "desc" },
  });
  if (existingRound) {
    io.to(id).emit("room:gameStarted", {
      message: "The game has started!",
      id,
      round: existingRound.id,
      definition: existingRound.currentDefinition,
    });
    io.to(id).emit("room:newWordReady", {
      definition: existingRound.currentDefinition,
    });
    return res.status(200).json({ ok: true, round: existingRound });
  }

  const category = room.category || "dino";
  const word = randomDefinition(category);

  const round = await prisma.round.create({
    data: {
      roomId: id,
      currentDefinition: word.definition,
      roundNumber: 1,
      currentAnswer: word.name,
      roundStarted: true,
    },
  });

  io.to(id).emit("room:gameStarted", {
    message: "The game has started!",
    id,
    round: round.id,
    definition: round.currentDefinition,
  });
  io.to(id).emit("room:newWordReady", { definition: round.currentDefinition });

  console.log(`Room ${id} game started, round 1`);
  return res.status(200).json({ ok: true, round });
};
