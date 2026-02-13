import { API_BASE_URL } from "../../utils/env";
import type { Player } from "../../types/players";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/socketProvider";
import { useContext } from "react";

export const useJoinRoom = () => {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const joinRoom = async ({
    username,
    roomId,
  }: {
    username: string;
    roomId: string;
  }) => {
    const roomIdLowercase = roomId.toLowerCase();
    try {
      const res = await fetch(`${API_BASE_URL}/room/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomId: roomIdLowercase }),
      });

      const data: {
        ok: boolean;
        roomId?: string;
        error?: string;
        player: Player;
      } = await res.json();

      if (data.ok && data.roomId && data.player) {
        localStorage.setItem(
          "player",
          JSON.stringify({ ...data.player, roomId: data.roomId }),
        );
        socket?.emit("room:join-socket", data.roomId);

        navigate(`/lobby/${data.roomId}`);
      }

      if (!data.ok) {
        throw new Error(data.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      throw new Error(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return { joinRoom };
};
