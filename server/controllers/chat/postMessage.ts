import type { NextFunction, Response, Request } from "express";
import { prisma } from "../../lib/prisma.ts";
import { io } from "../../index.ts";
import {
  getAcceptedAnswers,
  randomDefinition,
  wordsMatchAny,
} from "../../utils/utils.ts";

export const postMessage = async (
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

    io.to(id).emit("newMessage", uploadedMessage);

    // Round en cours = dernier round de la room (le seul qui “joue”)
    const currentRound = await prisma.round.findFirst({
      where: { roomId: id },
      orderBy: { roundNumber: "desc" },
    });

    const category = room.category || "dino";
    const acceptedAnswers = currentRound
      ? getAcceptedAnswers(category, currentRound.currentDefinition)
      : [];
    const isCorrect =
      currentRound &&
      acceptedAnswers.length > 0 &&
      wordsMatchAny(acceptedAnswers, message);

    if (isCorrect && currentRound) {
      const sender = await prisma.player.findUnique({
        where: { id: senderId },
      });

      await prisma.player.update({
        where: { id: senderId },
        data: { score: { increment: 1 } },
      });

      await prisma.round.update({
        where: { id: currentRound.id },
        data: { winnerId: senderId },
      });

      const word = randomDefinition(category);
      const nextRoundNumber = currentRound.roundNumber + 1;

      const newRound = await prisma.round.create({
        data: {
          roomId: id,
          roundNumber: nextRoundNumber,
          currentDefinition: word.definition,
          currentAnswer: word.name,
          roundStarted: true,
        },
      });

      io.to(id).emit("room:correctAnswer", {
        username: sender?.username ?? "Un joueur",
      });
      io.to(id).emit("room:newWordReady", {
        definition: newRound.currentDefinition,
      });
    }

    return res.status(200).json(uploadedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to post message" });
    next(error);
  }
};
