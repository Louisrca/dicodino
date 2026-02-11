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

io.on("connection", (socket) => {
  socket.join("room1");

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

    socket.join("room1");

    io.to("room1").emit("join", {
      pseudo,
      room: "room1",
    });
  });
});

io.listen(8080);
