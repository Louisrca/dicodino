import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.ts";
import {
  formalizeUsername,
  isValidUsername,
  trimString,
} from "../../utils/utils.ts";

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const usernameTrimmed = trimString(username);
  const passwordTrimmed = trimString(password);

  if (!isValidUsername(usernameTrimmed)) {
    return res.status(400).json({ ok: false, error: "Invalid username" });
  }

  try {
    const existing = await prisma.player.findFirst({
      where: { username: formalizeUsername(usernameTrimmed) },
    });

    if (existing) {
      return res
        .status(400)
        .json({ ok: false, error: "Username already exists" });
    }
  } catch (error) {
    console.error("Error checking existing player:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }

  try {
    const player = await prisma.player.create({
      data: { username: usernameTrimmed },
    });

    res.json({
      ok: true,
      player: { id: player.id, username: player.username },
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ ok: false, error: "Failed to create player" });
  }
};
