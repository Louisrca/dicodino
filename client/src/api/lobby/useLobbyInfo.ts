import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/env";
import type { Player } from "../../types/players";

interface LobbyData {
  id: string;
  category: string;
  players: Player[];
  hostId: string;
}

interface UseLobbyInfoReturn {
  players: Player[];
  category: string;
  hostId: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLobbyInfo = (roomId: string | null): UseLobbyInfoReturn => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [category, setCategory] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbyInfo = async () => {
    if (!roomId) {
      setError("id de la room non fourni");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${roomId}`);
      
      if (!res.ok) {
        throw new Error("Room non trouvé");
      }

      const data: LobbyData = await res.json();

      setPlayers(data.players || []);
      setCategory(data.category || "");
      setHostId(data.hostId || "");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error de recupération";
      console.error("Error de recupération:", err);
      setError(errorMessage);
      setPlayers([]);
      setCategory("");
      setHostId("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLobbyInfo();

    return () => {
      setPlayers([]);
      setCategory("");
      setHostId("");
    };
  }, [roomId]);

  return {
    players,
    category,
    hostId,
    isLoading,
    error,
    refetch: fetchLobbyInfo,
  };
};