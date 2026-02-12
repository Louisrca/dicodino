import { io } from "../../index.ts";

interface StartGamePayload {
  roomId: string;
}
  
  export const StartGameControllers = ({ roomId }: StartGamePayload) => {
    if (!roomId) {
      io.emit("room:error", { message: "Room ID is required" });
      return;
    }

    // Vérifie que la room existe
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      io.emit("room:error", { message: "Room not found" });
      return;
    }

    console.log(`Game started in room ${roomId}`);

    // Emit à toute la room
    io.to(roomId).emit("room:gameStarted", {
      message: "The game has started!",
      roomId,
    });
  };
