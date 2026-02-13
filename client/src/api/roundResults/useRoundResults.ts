import { API_BASE_URL } from "../../utils/env";

export const useRoundResults = () => {
  const roundResults = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/room/${id}/round/results`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching round results:", error);
      throw error;
    }
  };

  return { roundResults };
};
