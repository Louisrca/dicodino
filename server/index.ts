import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");

  console.log("Random word:", randomWord(["apple", "banana", "cherry"]));
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.join("room1");

  socket.on("join", (pseudo) => {
    if (!pseudo) return;

    io.to("room1").emit("join", {
      pseudo,
      room: "room1",
    });
  });

  socket.on("chat", (msg) => {
    io.to("room1").emit("chat", msg);
  });

  socket.on("leave", () => {
    socket.leave("room1");
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
