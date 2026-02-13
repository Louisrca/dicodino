import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";
import { randomDefinition } from "../../utils/utils.ts";

import type { Request, Response } from "express";

interface StartGamePayload {
  roomId: string;
}

export const StartGameControllers = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    io.emit("room:error", { message: "Room ID is required" });
    return;
  }

  // Vérifie que la room existe
  const room = io.sockets.adapter.rooms.get(id);
  if (!room) {
    io.emit("room:error", { message: "Room not found" });
    return;
  }

  console.log(`Game started in room ${id}`);

  const word = randomDefinition("dino");

  const round = await prisma.round.create({
    data: {
      roomId: id,
      currentDefinition: word.definition,
      roundNumber: 1,
      currentAnswer: word.name,
      roundStarted: true,
    },
  });

  if (!round) {
    io.emit("room:error", { message: "Failed to start game" });
    return;
  }

  io.to(id).emit("room:gameStarted", {
    message: "The game has started!",
    id,
    round: round.id,
    definition: round.currentDefinition,
  });

  io.to(id).emit("room:newWordReady", { definition: round.currentDefinition });

  console.log(`New word ready: ${round.currentDefinition}`);
  console.log(`Room ${id} game started`);
};
