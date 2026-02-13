export const useUser = () => {
  const createUser = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DINOCO_API_URL}/user/createUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  return { createUser };
};
