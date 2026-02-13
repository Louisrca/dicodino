import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.ts";
import { gameRoutes } from "./routes/gameRoutes.ts";
import {
  formalizeUsername,
  randomDefinition,
  reply,
  roomUpdate,
  trimString,
  updatePlayer,
  wordsMatch,
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
  console.log(`New connection: ${socket.id}`);

  // user:isConnected (reconnexion d'un client)
  socket.on(
    "user:isConnected",
    async (username: string, roomId: string, socketId: string) => {
      const isRoomExist = await prisma.room.findUnique({
        where: { id: roomId },
        include: { players: { where: { connected: true } } },
      });
      console.log(
        `User isConnected - username: "${username}", roomId: "${roomId}", socketId: ${socketId}`,
      );

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

  //  mot suivant
  socket.on("next_word", () => {
    console.log("Passage au mot suivant");
    io.to("room1").emit("new_word_ready");
  });

  // terminer la partie
  socket.on("end_game", () => {
    console.log("Fin de partie");
    io.to("room1").emit("game_ended");
  });

  // room:gameStart
  socket.on("room:gameStart", async (roomId: string, ack?: Function) => {
    const r = trimString(roomId);
    const definition = randomDefinition("dino").definition;

    io.to(r).emit("room:gameStarted", {
      message: "The game has started!",
      definition,
    });
    io.to(r).emit("room:newWordReady", { definition });
  });

  // Quitter une room
  socket.on("room:leave", async (roomId: string, ack?: unknown) => {
    const r = trimString(roomId);

    if (!r) {
      return reply(ack, { ok: false, error: "Invalid room ID" });
    }

    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id, roomId: r, connected: true },
      });

      if (!player) return reply(ack, { ok: false, error: "Not in this room" });

      const room = await prisma.room.findUnique({ where: { id: r } });
      if (!room) return reply(ack, { ok: false, error: "Room not found" });

      const isHost = room.hostId === player.id;

      if (isHost) {
        // L'hôte quitte : tous les joueurs sont exclus, la room reste en base
        io.to(r).emit("room:closed", { message: "Host left, room closed" });
        io.in(r).socketsLeave(r);

        await prisma.player.updateMany({
          where: { roomId: r, connected: true },
          data: { roomId: null, connected: false },
        });

        console.log(`Host left, room ${r} (room kept in DB)`);
        return reply(ack, { ok: true, roomId: r, closed: true });
      }

      // Joueur normal qui quitte
      await updatePlayer(player.id, { roomId: null, connected: false });
      await socket.leave(r);
      await roomUpdate(r, io);

      console.log(`${player.username} left room ${r}`);
      reply(ack, { ok: true, roomId: r });
    } catch (error) {
      console.error("Error leaving room:", error);
      reply(ack, { ok: false, error: "Server error" });
    }
  });

  socket.on(
    "random-definition",
    ({ roomId, category }: { roomId: string; category: string }) => {
      io.to(roomId).emit("definition", randomDefinition(category).definition);
    },
  );

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

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
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
