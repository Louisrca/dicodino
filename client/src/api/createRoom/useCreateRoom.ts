import type { Player } from "../../types/players";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/env";
import { SocketContext } from "../../context/socketProvider";
import { getToken, getTokenUsername, setToken, clearToken } from "../../utils/auth";
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
      let token = getToken();
      const sameUser = token && getTokenUsername(token)?.toLowerCase() === username.trim().toLowerCase();
      if (!sameUser) {
        const claimRes = await fetch(`${API_BASE_URL}/auth/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const claimData = await claimRes.json();
        if (!claimData.ok) {
          throw new Error(claimData.error || "Ce pseudo est déjà pris");
        }
        token = claimData.token as string;
        setToken(token);
      }
      if (!token) throw new Error("Session expirée");

      const res = await fetch(`${API_BASE_URL}/room/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category }),
      });
      if (res.status === 401) {
        clearToken();
        throw new Error("Session expirée, réessaie");
      }

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

      if (!data.ok) {
        throw new Error(data.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Error creating room:", err);
      throw new Error(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return { createRoom };
};
