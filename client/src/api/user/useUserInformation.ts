import { API_BASE_URL } from "../../utils/env";

export const useUserInformation = () => {
  const getUserInformation = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user information");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching user information:", error);
      return null;
    }
  };
  return { getUserInformation };
};
