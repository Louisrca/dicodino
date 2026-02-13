import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import { formalizeUsername, isValidUsername, trimString } from "../../utils/utils.ts";
import { signToken } from "../../auth/jwt.ts";

export const claimController = async (req: Request, res: Response) => {
  const u = trimString(req.body.username ?? "");
  if (!isValidUsername(u)) {
    return res.status(400).json({ ok: false, error: "Invalid username" });
  }

  const existing = await prisma.player.findFirst({
    where: { username: formalizeUsername(u) },
  });

  if (existing) {
    return res.status(401).json({ ok: false, error: "Ce pseudo est déjà pris" });
  }

  const player = await prisma.player.create({
    data: { username: formalizeUsername(u) },
  });

  const token = signToken({ playerId: player.id, username: player.username });

  res.status(200).json({
    ok: true,
    player: { id: player.id, username: player.username },
    token,
  });
};
