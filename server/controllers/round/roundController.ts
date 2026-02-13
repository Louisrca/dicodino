import type { Request, Response } from "express";
import { io } from "../../index.ts";
import { prisma } from "../../lib/prisma.ts";

type PlayerScore = {
  id: string;
  username: string;
  initialScore: number;
  pointsWon: number;
  finalScore: number;
};

export const roundController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    io.emit("room:error", { message: "Room ID is required" });
    return res.status(400).end();
  }

  if (!prisma.room.findUnique({ where: { id } })) {
    io.emit("room:error", { message: "Room not found" });
    return res.status(404).end();
  }

  const getRoundsByRoomId = await prisma.round.findMany({
    where: { roomId: id },
    orderBy: { roundNumber: "asc" },
  });

  if (!getRoundsByRoomId || getRoundsByRoomId.length === 0) {
    io.emit("room:error", { message: "No rounds found for this room" });
    return res.status(404).end();
  }

  // Exclure les rounds sans winner
  const roundsWithWinner = getRoundsByRoomId.filter((r) => r.winnerId !== null);

  if (roundsWithWinner.length === 0) {
    io.emit("room:error", { message: "No rounds with winners found" });
    return res.status(404).end();
  }

  const playerIds = [
    ...new Set(
      roundsWithWinner
        .map((r) => r.winnerId)
        .filter((id): id is string => id !== null),
    ),
  ];

  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, username: true, score: true },
  });

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const pointsWonDuringGame: Record<string, number> = {};

  roundsWithWinner.forEach((round) => {
    if (round.winnerId) {
      pointsWonDuringGame[round.winnerId] =
        (pointsWonDuringGame[round.winnerId] || 0) + 1;
    }
  });

  const playerScores: PlayerScore[] = playerIds.map((playerId) => {
    const player = playerMap.get(playerId);
    const pointsWon = pointsWonDuringGame[playerId] || 0;
    const initialScore = (player?.score || 0) - pointsWon;
    const finalScore = player?.score || 0;

    return {
      id: playerId,
      username: player?.username || "Unknown",
      initialScore,
      pointsWon,
      finalScore,
    };
  });

  const scoreResults = roundsWithWinner.map((round) => ({
    roundNumber: round.roundNumber,
    definition: round.currentDefinition,
    answer: round.currentAnswer,
    playerId: round.winnerId,
    playerUsername: playerMap.get(round.winnerId || "")?.username || "Unknown",
  }));

  return res.status(200).json({
    ok: true,
    score: scoreResults,
    playerScores: playerScores,
  });
};
