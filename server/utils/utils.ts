import type { Server } from "socket.io";
import { prisma } from "../lib/prisma.ts";
import type { Definition } from "../types/definition.ts";
import { DinoDef } from "../constants/dino-def.ts";
import { SportDef } from "../constants/sport-def.ts";
import { FoodDef } from "../constants/fond-def.ts";

export const MAX_PLAYERS = 4;

export function trimString(v: string) {
  return String(v ?? "").trim();
}

export function isValidUsername(username: string): boolean {
  return (
    username.trim().length > 1 &&
    username.trim().length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
}

export function isValidCategory(category: string): boolean {
  return category.trim().length > 1;
}

export function formalizeUsername(username: string): string {
  if (!username) return "";
  return username.trim().toLowerCase();
}

export function formalizeCategory(category: string): string {
  if (!category) return "";
  return category.trim().toLowerCase();
}

const switchCategory = (category: string): Definition[] => {
  switch (category) {
    case "sport":
      return SportDef;
    case "food":
      return FoodDef;
    default:
      return DinoDef;
  }
};

export const randomDefinition = (categoryName: string): Definition => {
  const category = switchCategory(categoryName);

  const randomIndex = Math.floor(Math.random() * category.length);

  if (!category[randomIndex]) {
    throw new Error("Random index does not exist in the array");
  }

  return category[randomIndex];
};

export function makeRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function reply(ack: unknown, payload: any) {
  if (typeof ack === "function") (ack as (p: any) => void)(payload);
}

export async function uniqueRoomId(): Promise<string> {
  let id = makeRoomId();
  while (await prisma.room.findUnique({ where: { id } })) {
    id = makeRoomId();
  }
  return id;
}

export async function roomUpdate(roomId: string, io: Server): Promise<void> {
  const players = await prisma.player.findMany({
    where: {
      roomId,
      connected: true,
    },
  });

  if (!players) return;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return;

  // Format identique à l'API HTTP pour éviter les conflits côté client
  const playersData = players.map((p: { id: string; username: string }) => ({
    id: p.id,
    username: p.username,
  }));

  io.to(roomId).emit("room:update", {
    roomId,
    category: room.category,
    players: playersData,
  });
}

export function normalizeWord(word: string) {
  if (!word) return "";

  return (
    word
      .toLowerCase()
      .trim()
      .normalize("NFD")
      // .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
  );
}

export function wordsMatch(wordToGuess: string, userAnswer: string) {
  return normalizeWord(wordToGuess) === normalizeWord(userAnswer);
}

// Helper: Trouver ou créer un player
export async function getOrCreatePlayer(username: string) {
  const formalUsername = formalizeUsername(username);

  // D'abord chercher par username (reconnexion du même client)
  let player = await prisma.player.findFirst({
    where: { username: formalUsername },
  });

  // Si trouvé par username, on le met à jour avec le nouveau username
  if (player) {
    return await prisma.player.update({
      where: { id: player.id },
      data: { connected: true },
    });
  }

  // Sinon, créer un nouveau player
  return await prisma.player.create({
    data: { username: formalUsername, connected: true },
  });
}

// Helper: Mettre à jour un player
export async function updatePlayer(playerId: string, data: any) {
  return await prisma.player.update({
    where: { id: playerId },
    data,
  });
}
