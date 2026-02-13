import type { Player } from "../../types/players";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/env";
import { SocketContext } from "../../context/socketProvider";
import { useContext } from "react";

export const useCreateRoom = () => {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const createRoom = async ({
    username,
    category,
  }: {
    username: string;
    category: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/room/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, category }),
      });

      const data: {
        ok: boolean;
        room?: { id: string; hostId: string };
        error?: string;
        player?: Player;
      } = await res.json();

      if (data.ok && data.room && data.player) {
        localStorage.setItem(
          "player",
          JSON.stringify({
            ...data.player,
            roomId: data.room.id,
            isHost: data.room.hostId === data.player.id,
          }),
        );
        socket?.emit("room:join-socket", data.room.id);
        navigate(`/lobby/${data.room.id}`);
      }
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return { createRoom };
};
