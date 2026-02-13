import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";
import { randomDefinition } from "../../utils/utils.ts";

import type { Request, Response } from "express";

interface StartGamePayload {
  roomId: string;
}

export const StartGameControllers = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
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

  const definition = randomDefinition("dino").definition;
  const answer = randomDefinition("dino").name;

  const round = await prisma.round.create({
    data: {
      roomId: id,
      currentDefinition: definition,
      roundNumber: 1,
      currentAnswer: answer,
      roundStarted: true,
    },
  });

  if (!round) {
    io.emit("room:error", { message: "Failed to start game" });
    return;
  }

  // Emit à toute la room
  io.to(id).emit("room:gameStarted", {
    message: "The game has started!",
    id,
    round: round.id,
    definition,
  });

  io.to(id).emit("room:newWordReady", { definition });

  console.log(`New word ready: ${definition}`);
  console.log(`Room ${id} game started`);
};
