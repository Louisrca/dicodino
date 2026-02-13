import type { Message } from "../../types/message";
import { API_BASE_URL } from "../../utils/env";

export const useRoomMessage = () => {
  const getMessageByRoomId = async (
    roomId: string,
  ): Promise<Message[] | undefined> => {
    if (!roomId) return undefined;
    try {
      const res = await fetch(`${API_BASE_URL}/room/message/${roomId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching messages:", err);
      return undefined;
    }
  };

  const postMessage = async (
    roomId: string,
    senderId: string,
    content: string,
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/room/${roomId}/message/${senderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: content }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error posting message:", error);
      throw error;
    }
  };

  return { postMessage, getMessageByRoomId };
};
