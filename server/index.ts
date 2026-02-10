import { Server } from "socket.io";
import { gameRoutes } from "./routes/gameRoutes.ts";

import express from "express";

const app = express();

app.use(express.json());

app.use("/api/items", gameRoutes);

const io = new Server({
  cors: {
    origin: '*',
  },
});

type Room = { category: string; players: string[] };
const rooms = new Map<string, Room>();
const users = new Map<string, { pseudo: string; roomId: string }>();

const MAX_PLAYERS = 4;

function makeRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
function uniqueRoomId() {
  let id = makeRoomId();
  while (rooms.has(id)) id = makeRoomId();
  return id;
}
function clean(v: unknown) {
  return String(v ?? '').trim();
}

function isValidPseudo(pseudo: string) {
  return pseudo.trim().length > 3;
}

function formalizePseudo(pseudo: string) {
  return pseudo.trim().toLowerCase();
}

function pseudoTaken(room: Room, pseudo: string) {
  const key = formalizePseudo(pseudo);
  return room.players.some((p) => formalizePseudo(p) === key);
}

function roomUpdate(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit('room:update', {
    roomId,
    category: room.category,
    players: room.players,
  });
}

function removeUser(socketId: string) {
  const u = users.get(socketId);
  if (!u) return;
  
  const room = rooms.get(u.roomId);
  if (room) {
    room.players = room.players.filter((p) => p !== u.pseudo);
    if (room.players.length === 0) {
      rooms.delete(u.roomId);
    } else {
      roomUpdate(u.roomId);
    }
  }
}

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  // Création: pseudo + room + category
  socket.on(
    'room:create',
    async (pseudo: string, category: string, ack?: Function) => {
      const p = clean(pseudo);
      const c = clean(category);

      if (!isValidPseudo(p)) {
        console.log(`Invalid pseudo attempt: "${pseudo}"`);
        return ack?.({ ok: false, error: 'Invalid pseudo' });
      }
      if (!c) {
        console.log(`Invalid category attempt`);
        return ack?.({ ok: false, error: 'Invalid category' });
      }

      removeUser(socket.id);

      const roomId = uniqueRoomId();
      rooms.set(roomId, { category: c, players: [p] });
      users.set(socket.id, { pseudo: p, roomId });

      await socket.join(roomId);
      roomUpdate(roomId);
      console.log(`Room created: ${roomId} by ${p} (${c})`);
      ack?.({ ok: true, roomId });
    },
  );

  //Rejoindre : pseudo + room
  socket.on('room:join', async (pseudo: string, roomId: string, ack?: Function) => {
      const p = clean(pseudo);

      if (!isValidPseudo(p)) {
        console.log(`Invalid pseudo attempt: "${pseudo}"`);
        return ack?.({ ok: false, error: 'Invalid pseudo' });
      }

      const room = rooms.get(roomId);
      if (!room) {
        console.log(`Room not found: ${roomId}`);
        return ack?.({ ok: false, error: 'Room not found' });
      }

      if (room.players.length >= MAX_PLAYERS) {
        console.log(`Room is full: ${roomId}`);
        return ack?.({ ok: false, error: 'Room is full' });
      }

      if (pseudoTaken(room, p)) {
        console.log(`Pseudo already taken: ${p}`);
        return ack?.({ ok: false, error: 'Pseudo already taken' });
      }

      removeUser(socket.id);
      users.set(socket.id, { pseudo: p, roomId });
      room.players.push(p);

      await socket.join(roomId);
      roomUpdate(roomId);

      console.log(`${p} joined room ${roomId} (${room.players.length}/${MAX_PLAYERS})`);
      ack?.({ ok: true, roomId });
    },
  );

  //Salle d'attente
  socket.on('room:get', async (roomId: string, ack?: Function) => {
    const id = clean(roomId);
    const room = rooms.get(id);
    if (!room) {
      console.log(`Room get failed: ${id} not found`);
      return ack?.({ ok: false, error: 'Room not found' });
    }
    console.log(`Room info requested: ${id}`);
    ack?.({
      ok: true,
      room: { roomId: id, category: room.category, players: room.players },
    });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    removeUser(socket.id);
  });
});

io.listen(8080);
console.log('Server listening on port 8080');
