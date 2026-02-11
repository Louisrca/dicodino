import { Server } from 'socket.io';
import { gameRoutes } from './routes/gameRoutes.ts';
import express from 'express';
import {prisma} from './lib/prisma.ts';

const app = express();

app.use(express.json());

app.use('/api/items', gameRoutes);

const io = new Server({
  cors: {
    origin: '*',
  },
});

const MAX_PLAYERS = 4;

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function isValidUsername(username: string): boolean {
  return username.trim().length > 1;
}

function formalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function makeRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function uniqueRoomId(): Promise<string> {
  let id = makeRoomId();
  while (await prisma.room.findUnique({ where: { id } })) {
    id = makeRoomId();
  }
  return id;
}

async function roomUpdate(roomId: string): Promise<void> {
  const players = await prisma.player.findMany({
    where: { roomId },
    select: { username: true },
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

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Création: pseudo + room + category
  socket.on(
    'room:create',
    async (username: string, category: string, ack?: Function) => {
      const u = clean(username);
      const c = clean(category);

      if (!isValidUsername(u)) {
        console.log(`Invalid username attempt: "${u}"`);
        return ack?.({ ok: false, error: 'Invalid username' });
      }
      if (!c) {
        console.log(`Invalid category attempt`);
        return ack?.({ ok: false, error: 'Invalid category' });
      }

      const roomId = await uniqueRoomId();
      await prisma.room.create({ data: { id: roomId, category: c, host: u} });
      await prisma.player.create({
        data: { username: formalizeUsername(u), socketId: socket.id, roomId },
      });

      await socket.join(roomId);
      await roomUpdate(roomId);

      console.log(`Room created: ${roomId} by ${u} (${c})`);
      ack?.({ ok: true, id: socket.id, roomId });
    },
  );

  //Rejoindre : pseudo + room
  socket.on(
    'room:join',
    async (username: string, roomId: string, ack?: Function) => {
      const u = clean(username);

      if (!isValidUsername(u)) {
        console.log(`Invalid username attempt: "${u}"`);
        return ack?.({ ok: false, error: 'Invalid username' });
      }

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { players: true },
      });
      if (!room) {
        console.log(`Room not found: ${roomId}`);
        return ack?.({ ok: false, error: 'Room not found' });
      }

      if (room.players.length >= MAX_PLAYERS) {
        console.log(`Room is full: ${roomId}`);
        return ack?.({ ok: false, error: 'Room is full' });
      }

      const existingUsername = room.players.find(
        (p: { username: string }) =>
          formalizeUsername(p.username) === formalizeUsername(u),
      );

      if (existingUsername) {
        console.log(`Username already taken: ${u}`);
        return ack?.({ ok: false, error: 'Username already taken' });
      }

      await prisma.player.create({
        data: { username: u, socketId: socket.id, roomId },
      });
      await socket.join(roomId);
      await roomUpdate(roomId);

      console.log(
        `${u} joined room ${roomId} (${room.players.length}/${MAX_PLAYERS})`,
      );
      ack?.({ ok: true, roomId });
    },
  );

  //Salle d'attente
  socket.on('room:get', async (roomId: string, ack?: Function) => {
    const id = clean(roomId);
    const room = await prisma.room.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!room) {
      console.log(`Room not found: ${id}`);
      return ack?.({ ok: false, error: 'Room not found' });
    }

    console.log(`Room info : ${id}`);
    ack?.({
      ok: true,
      room: { roomId: id, category: room.category, players: room.players },
    });
  });

  socket.on('room:leave', async (username: string, roomId: string, ack?: Function) => {
    const u = clean(username);
    const r = clean(roomId);

    const player = await prisma.player.findFirst({
      where: { username: u, roomId: r },
    });

    if (!player) {
      return ack?.({ ok: false, error: 'Player not found in room' });
    }

    await prisma.player.delete({ where: { id: player.id } });
    await socket.leave(r);
    console.log(`👋 ${u} left room ${r}`);

    const roomPlayers = await prisma.player.findMany({ where: { roomId: r } });

    if (roomPlayers.length === 0) {
      await prisma.room.delete({ where: { id: r } });
      console.log(`🧹 Room ${r} deleted`);
    } else {
      await roomUpdate(r);
    }

    ack?.({ ok: true, roomId: r });
  });

  socket.on('disconnect', async () => {
    const player = await prisma.player.findFirst({ where: { socketId: socket.id } });
    if (!player) return;

    await prisma.player.delete({ where: { id: player.id } });

    const roomPlayers = await prisma.player.findMany({ where: { roomId: player.roomId } });
    if (roomPlayers.length === 0) {
      await prisma.room.delete({ where: { id: player.roomId } });
      console.log(`🧹 Room ${player.roomId} deleted`);
    } else {
      await roomUpdate(player.roomId);
    }
  });
});

io.listen(8081);
console.log('Server listening on port 8081');
