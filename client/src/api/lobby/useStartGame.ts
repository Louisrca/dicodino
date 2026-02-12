import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";

interface GameStartData {
  message: string;
  roomId?: string;
}

export const useGameStart = (socket: Socket | null, roomId: string | null) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleGameStart = (data: GameStartData) => {
      console.log("Game started:", data.message);
      
      const playerData = localStorage.getItem("player");
      if (playerData) {
        const player = JSON.parse(playerData);
        localStorage.setItem(
          "player",
          JSON.stringify({
            ...player,
            gameStarted: true,
          })
        );
      }

      navigate(`/room/${roomId}`);
    };

    socket.on("room:gameStarted", handleGameStart);

    return () => {
      socket.off("room:gameStarted", handleGameStart);
    };
  }, [socket, roomId, navigate]);
};