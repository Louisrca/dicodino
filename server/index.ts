import express from "express";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma.ts";
import { gameRoutes } from "./routes/gameRoutes.ts";
import {
  currentWord,
  formalizeUsername,
  isValidCategory,
  isValidUsername,
  MAX_PLAYERS,
  reply,
  roomUpdate,
  trimString,
  uniqueRoomId,
  wordsMatch,
} from "./utils/utils.ts";

const app = express();

app.use(express.json());
app.use("/api/items", gameRoutes);

const io = new Server({
  cors: {
    origin: "*",
  },
});

// Helper: Trouver ou créer un player
async function getOrCreatePlayer(username: string, socketId: string) {
  const formalUsername = formalizeUsername(username);
  
  // D'abord chercher par socketId (reconnexion du même client)
  let player = await prisma.player.findFirst({
    where: { socketId },
  });

  // Si trouvé par socketId, on le met à jour avec le nouveau username
  if (player) {
    return await prisma.player.update({
      where: { id: player.id },
      data: { username: formalUsername },
    });
  }

  // Sinon, chercher par username (player déconnecté qui revient)
  player = await prisma.player.findFirst({
    where: { 
      username: formalUsername,
      connected: false, // ← Important : seulement si déconnecté
    },
  });

  // Si trouvé, on le réactive
  if (player) {
    return player;
  }

  // Sinon, créer un nouveau player
  return await prisma.player.create({
    data: { username: formalUsername, socketId, connected: true },
  });
}

// Helper: Mettre à jour un player
async function updatePlayer(playerId: string, data: any) {
  return await prisma.player.update({
    where: { id: playerId },
    data,
  });
}

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);
  socket.on("connect", () => {
    console.log(`Client connected: ${socket.id}`);
  });

    socket.on("chat", (msg) => {
    console.log("message: " + msg);
    
    const isCorrect = wordsMatch(msg, currentWord);
    
    if (isCorrect) {
      // bonne reponse
      console.log("Quelqu'un a trouvé le mot !");
      
      io.to("room1").emit("chat", {
        type: "system",
        message: `Un joueur a trouvé le mot : "${currentWord}" !`
      });
      
      io.to("room1").emit("word_found", {
        word: currentWord
      });
      
    } else {
      // mauvaise reponse
      io.to("room1").emit("chat", {
        type: "player",
        message: msg
      });
    }
  });

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

  // Créer une room
  socket.on("room:create", async (username: string, category: string, ack?: Function) => {
    const u = trimString(username);
    const c = trimString(category);

    if (!isValidUsername(u)) return ack?.({ ok: false, error: "Invalid username" });
    if (!isValidCategory(c)) return ack?.({ ok: false, error: "Invalid category" });

    try {
      // Récupérer ou créer le player
      const player = await getOrCreatePlayer(u, socket.id);

      // Vérifier qu'il n'est pas déjà dans une room active
      if (player.connected && player.roomId) {
        return ack?.({ ok: false, error: "Already in a room. Leave first." });
      }

      // Créer la room
      const roomId = await uniqueRoomId();
      await prisma.room.create({ 
        data: { id: roomId, category: c, hostId: player.id } 
      });

      // Associer le player à la room
      await updatePlayer(player.id, {
        socketId: socket.id,
        roomId,
        connected: true,
        score: 0,
      });

      await socket.join(roomId);
      await roomUpdate(roomId, io);

      console.log(`Room ${roomId} created by ${u}`);
      ack?.({ ok: true, roomId });
    } catch (error) {
      console.error("Error creating room:", error);
      ack?.({ ok: false, error: "Server error" });
    }
  });

  // Rejoindre une room
  socket.on("room:join", async (username: string, roomId: string, ack?: Function) => {
    const u = trimString(username);
    const r = trimString(roomId);

    console.log(`📥 room:join attempt - username: "${u}", roomId: "${r}", socketId: ${socket.id}`);

    if (!isValidUsername(u)) {
      console.log(`❌ Invalid username: "${u}"`);
      return ack?.({ ok: false, error: "Invalid username" });
    }

    try {
      const room = await prisma.room.findUnique({
        where: { id: r },
        include: { players: { where: { connected: true } } },
      });

      if (!room) {
        console.log(`❌ Room not found: ${r}`);
        return ack?.({ ok: false, error: "Room not found" });
      }

      console.log(`✅ Room found: ${r}, current players: ${room.players.length}/${MAX_PLAYERS}`);

      if (room.players.length >= MAX_PLAYERS) {
        console.log(`❌ Room is full`);
        return ack?.({ ok: false, error: "Room is full" });
      }

      // Vérifier que le username n'est pas déjà pris DANS CETTE ROOM
      const usernameTaken = room.players.some(
        p => formalizeUsername(p.username) === formalizeUsername(u)
      );
      
      if (usernameTaken) {
        console.log(`❌ Username "${u}" already taken in room ${r}`);
        return ack?.({ ok: false, error: "Username already taken" });
      }

      // Récupérer ou créer le player
      const player = await getOrCreatePlayer(u, socket.id);
      console.log(`Player found/created: ${player.id}, username: ${player.username}`);

      // Vérifier qu'il n'est pas déjà connecté ailleurs
      if (player.connected && player.roomId && player.roomId !== r) {
        console.log(`❌ Player already in room ${player.roomId}`);
        return ack?.({ ok: false, error: "Already in another room" });
      }

      // Associer le player à la room
      await updatePlayer(player.id, {
        socketId: socket.id,
        roomId: r,
        connected: true,
        score: 0,
      });

      await socket.join(r);
      await roomUpdate(r, io);

      console.log(`✅ ${u} joined room ${r}`);
      ack?.({ ok: true, roomId: r });
    } catch (error) {
      console.error("❌ Error joining room:", error);
      ack?.({ ok: false, error: "Server error" });
    }
  });

  // Infos room
  socket.on("room:get", async (roomId: string, ack?: Function) => {
    const id = trimString(roomId);

    // Validation du roomId
    if (!id || id.length === 0) {
      return ack?.({ ok: false, error: "Invalid room ID" });
    }

    try {
      const room = await prisma.room.findUnique({
        where: { id },
        include: { players: { where: { connected: true } } },
      });

      if (!room) return ack?.({ ok: false, error: "Room not found" });

      ack?.({
        ok: true,
        room: { 
          roomId: id, 
          category: room.category, 
          players: room.players.map(p => ({ username: p.username })) 
        },
      });
    } catch (error) {
      console.error("Error getting room:", error);
      ack?.({ ok: false, error: "Server error" });
    }
  });

  // Quitter une room
  socket.on("room:leave", async (roomId: string, ack?: unknown) => {
    const r = trimString(roomId);

    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id, roomId: r, connected: true },
      });

      if (!player) return reply(ack, { ok: false, error: "Not in this room" });

      const room = await prisma.room.findUnique({ where: { id: r } });
      if (!room) return reply(ack, { ok: false, error: "Room not found" });

      const isHost = room.hostId === player.id;

      if (isHost) {
        // L'hôte quitte: fermer la room pour tous
        io.to(r).emit("room:closed", { message: "Host left, room closed" });
        io.in(r).socketsLeave(r);

        await prisma.player.updateMany({
          where: { roomId: r, connected: true },
          data: { connected: false },
        });

        console.log(`Host left, room ${r} closed`);
        return reply(ack, { ok: true, roomId: r, closed: true });
      }

      // Joueur normal qui quitte
      await updatePlayer(player.id, { connected: false });
      await socket.leave(r);
      await roomUpdate(r, io);

      console.log(`${player.username} left room ${r}`);
      reply(ack, { ok: true, roomId: r });
    } catch (error) {
      console.error("Error leaving room:", error);
      reply(ack, { ok: false, error: "Server error" });
    }
  });

  // Déconnexion
  socket.on("disconnect", async () => {
    console.log("Disconnect:", socket.id);

    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id, connected: true },
      });

      if (!player) return;

      const r = player.roomId;
      if (!r) {
        await updatePlayer(player.id, { connected: false, socketId: null });
        return;
      }

      const room = await prisma.room.findUnique({ where: { id: r } });
      if (!room) {
        await updatePlayer(player.id, { connected: false, socketId: null });
        return;
      }

      const isHost = room.hostId === player.id;

      await updatePlayer(player.id, { connected: false, socketId: null });
      await roomUpdate(r, io);

      console.log(`Player ${player.username} disconnected`);
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
});

io.listen(8081);
console.log("Server listening on port 8081");