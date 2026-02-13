import { API_BASE_URL } from "../../utils/env";

export const useGameStart = () => {
  const startGame = async (lobbyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lobby/${lobbyId}/start`, {
        method: "POST",
        
      });

      if (!response.ok) {
        throw new Error("Failed to start game");
      }

      const data = await response.json();
      console.log("Game started successfully:", data);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return { startGame };
};
