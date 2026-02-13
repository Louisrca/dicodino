import { API_BASE_URL } from "../../utils/env";

export const useLeaveRoom = () => {
  const leaveRoom = async () => {
    const raw = localStorage.getItem("player");
    const player = raw ? (JSON.parse(raw) as { id?: string; roomId?: string }) : null;
    const playerId = player?.id;
    const roomId = player?.roomId;

    if (!playerId || !roomId) {
      throw new Error("Aucune room en cours");
    }

    const res = await fetch(`${API_BASE_URL}/room/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, roomId }),
    });
    if (!res.ok) throw new Error("Failed to leave room");

    const data = await res.json();
    if (data.ok) {
      localStorage.removeItem("player");
      window.location.reload();
    }
    return data;
  };

  return { leaveRoom };
};