import { Server } from 'socket.io';
import { gameRoutes } from './routes/gameRoutes.ts';
import express from 'express';
import { prisma } from './lib/prisma.ts';

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

      const existingPlayer = await prisma.player.findUnique({
        where: { socketId: socket.id },
      });
      if (existingPlayer)
        return ack?.({ ok: false, error: 'Already in a room' });

      const roomId = await uniqueRoomId();
      await prisma.room.create({ data: { id: roomId, category: c, host: u } });
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

      const existingPlayer = await prisma.player.findUnique({
        where: { socketId: socket.id },
      });
      if (existingPlayer)
        return ack?.({ ok: false, error: 'Already in a room' });

      await prisma.player.create({
        data: { username: formalizeUsername(u), socketId: socket.id, roomId },
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

  function reply(ack: unknown, payload: any) {
    if (typeof ack === 'function') (ack as (p: any) => void)(payload);
  }

  socket.on(
    'room:leave',
    async ( roomId: string, ack?: unknown) => {
      const r = clean(roomId);

      const player = await prisma.player.findFirst({
        where: { socketId: socket.id, roomId: r },
      });

      if (!player)
        return reply(ack, { ok: false, error: 'Player not found in room' });

      const room = await prisma.room.findUnique({ where: { id: r } });
      if (!room) return reply(ack, { ok: false, error: 'Room not found' });

      const isHost = formalizeUsername(room.host) === player.username;

      if (isHost) {
        io.to(r).emit('room:closed', {
          message: 'Host has left, room is closed',
        });
        io.in(r).socketsLeave(r);

        await prisma.player.deleteMany({ where: { roomId: r } });
        await prisma.room.delete({ where: { id: r } });

        return reply(ack, { ok: true, roomId: r, close: true });
      }

      await prisma.player.delete({ where: { id: player.id } });
      await socket.leave(r);

      const playerCount = await prisma.player.count({ where: { roomId: r } });
      if (playerCount === 0) {
        await prisma.room.delete({ where: { id: r } });
      } else {
        await roomUpdate(r);
      }

      return reply(ack, { ok: true, roomId: r });
    },
  );

  socket.on('disconnect', async () => {
    console.log('Disconnect:', socket.id);
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id},
      });

      if (!player)
        return;

      const r = player.roomId;

      const room = await prisma.room.findUnique({ where: { id: r } });
      if (!room) {
        await prisma.player.delete({ where: { id: player.id } }).catch(() => {});
        return;
      }

      const isHost = formalizeUsername(room.host) === player.username;

      if (isHost) {
        console.log(`Host disconnected → closing room ${r}`);

        io.to(r).emit('room:closed', { message: 'Host disconnected, room closed' });
        io.in(r).socketsLeave(r);

        await prisma.player.deleteMany({ where: { roomId: r } });
        await prisma.room.delete({ where: { id: r } });

        return;
      }

      await prisma.player.delete({ where: { id: player.id } });

      const count = await prisma.player.count({ where: { roomId: r } });

      if (count === 0) {
        console.log(`🧹 Room ${r} deleted (last player left)`);
        await prisma.room.delete({ where: { id: r } });
      } else {
        await roomUpdate(r);
      }
    },
  );
});

io.listen(8081);
console.log('Server listening on port 8081');
