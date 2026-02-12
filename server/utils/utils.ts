import type { Server } from 'socket.io';
import { prisma } from '../lib/prisma.ts';

export const MAX_PLAYERS = 4;

export function trimString(v: string) {
  return v.trim();
}

export function isValidUsername(username: string): boolean {
  return username.trim().length > 1;
}

export function isValidCategory(category: string): boolean {
  return category.trim().length > 1;
}

export function formalizeUsername(username: string): string {
  if(!username) return '';
  return username.trim().toLowerCase();
}

export function formalizeCategory(category: string): string {
  if(!category) return '';
  return category.trim().toLowerCase();
}

export function makeRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function reply(ack: unknown, payload: any) {
  if (typeof ack === 'function') (ack as (p: any) => void)(payload);
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
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return;

  const usernames = players.map((p: { username: string }) => p.username);

  io.to(roomId).emit('room:update', {
    roomId,
    category: room.category,
    players: usernames,
  });
}

export function normalizeWord(word: string) {
  if (!word) return '';
  
  return word
    .toLowerCase()
    .trim()
    .normalize("NFD")
    // .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
}

export function wordsMatch(word1: string , word2: string) {
  return normalizeWord(word1) === normalizeWord(word2);
}

// mot à deviner
export const currentWord = "chat";
