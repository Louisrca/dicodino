import { Server } from "socket.io";
import { gameRoutes } from "./routes/gameRoutes.ts";

import express from "express";

const app = express();

app.use(express.json());

app.use("/api/items", gameRoutes);

const io = new Server({
  cors: {
    origin: "*",
  },
});

const rooms = new Map();
const users = new Map();

function clean(v) {
  return String(v ?? "").trim();
}

function makeRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
}

function uniqueRoomId() {
  let id = makeRoomId();
  while (rooms.has(id)) id = makeRoomId();
  return id;
}

function isValidPseudo(pseudo) {
  return typeof pseudo === "string" && pseudo.trim().length > 3;
}

function formalizePseudo(pseudo) {
  return pseudo.trim().toLowerCase();
}

// Create a snapshot of the current state
function snapshot(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const players = [];
  for (const [socketId, pseudo] of room.players.entries()) {
    players.push({ pseudo });
  }

  return {
    roomId,
    category: room.category,
    players,
  };
}

function broadcastRoom(roomId) {
  io.to(roomId).emit("room:update", snapshot(roomId));
}

io.on("connection", (socket) => {
  socket.join("room2");

  socket.on("leave", () => {
    socket.disconnect();
    console.log("a user disconnected");
  });

  socket.on("chat", (msg) => {
    console.log("message: " + msg);
    io.emit("chat", msg);
  });

  socket.on("join", (pseudo) => {
    if (!pseudo) return;

    socket.join("room2");

    io.to("room2").emit("join", {
      pseudo,
      room: "room2",
    });
  });
});

io.listen(8080);
