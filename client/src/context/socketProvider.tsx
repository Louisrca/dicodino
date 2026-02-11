import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
  socket: Socket | null;
  socketId?: string;
  message?: string;
}>({ socket: null, socketId: undefined });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");

  const player = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );

  useEffect(() => {
    const newSocket = io("http://localhost:8081");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connecté au serveur");
      setSocketId(newSocket.id);
      if (player?.username && player?.roomId) {
        newSocket.emit(
          "user:isConnected",
          player.username,
          player.roomId,
          newSocket.id,
        );
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Déconnecté du serveur");
    });

    newSocket.on("message", (message) => {
      setMessage(message);
    });

    return () => {
      newSocket?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId, message }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
