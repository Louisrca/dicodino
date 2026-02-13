import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.ts";
import { gameRoutes } from "./routes/gameRoutes.ts";
import {
  formalizeUsername,
  reply,
  roomUpdate,
  trimString,
  updatePlayer,
} from "./utils/utils.ts";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  express.json(),
);

const server: http.Server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  // user:isConnected (reconnexion d'un client)
  socket.on(
    "user:isConnected",
    async (username: string, roomId: string, socketId: string) => {
      const isRoomExist = await prisma.room.findUnique({
        where: { id: roomId },
        include: { players: { where: { connected: true } } },
      });

      if (!isRoomExist) {
        console.log(`❌ Room not found: ${roomId}`);
        return;
      }

      const player = await prisma.player.findFirst({
        where: { username: formalizeUsername(username) },
      });
      if (!player) {
        console.log(`❌ Player not found: ${username}`);
        return;
      }

      await updatePlayer(player.id, { socketId, roomId, connected: true });
      await socket.join(roomId);
      await roomUpdate(roomId, io);

      console.log(`✅ ${username} reconnected to room ${roomId}`);
    },
  );

  // Quitter une room
  socket.on("room:leave", async (roomId: string, ack?: unknown) => {
    
  });

  socket.on("room:join-socket", async (roomId: string, ack?: Function) => {
    const r = trimString(roomId);

    try {
      await socket.join(r);
      await roomUpdate(r, io);

      console.log(`✅ Socket joined room: ${r}`);
      ack?.({ ok: true });
    } catch (error) {
      console.error("Error joining socket room:", error);
      ack?.({ ok: false });
    }
  });

  // Déconnexion
  socket.on("disconnect", async () => {
    const player = await prisma.player.findFirst({
      where: { socketId: socket.id, connected: true },
    });

    if (!player) return;

    const r = player.roomId;
    const room = r ? await prisma.room.findUnique({ where: { id: r } }) : null;

    await updatePlayer(player.id, {
      connected: false,
      roomId: null,
      socketId: null,
    });
    if (room) {
      await roomUpdate(r!, io);
    }
  });
});

app.use("/api/dicodino", gameRoutes);

server.listen(8081, () => {
  console.log("API listening on port 8081");
});
