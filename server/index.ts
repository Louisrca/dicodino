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

const MAX_PLAYERS = 4;

function clean(v: unknown) {
  return String(v ?? '').trim();
}

function isValidPseudo(pseudo: string) {
  return pseudo.trim().length > 1;
}

function formalizePseudo(pseudo: string) {
  return pseudo.trim().toLowerCase();
}

function makeRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function uniqueRoomId() {
  
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

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  // Création: pseudo + room + category
  socket.on('room:create', async (pseudo: string, category: string, ack?: Function) => {
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
