import { io, type Socket } from "socket.io-client";
import Timer from "../Timer/Timer";
import styles from "./RoomHeader.module.css";
import { useEffect, useRef, useState } from "react";

const RoomHeader = () => {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState("Déconnecté");
  const [category, setCategory] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    socketRef.current = io("http://localhost:8081");

    socketRef.current.on("connect", () => {
      setStatus("Connecté");
      console.log("✅ Connecté au serveur");
    });

    socketRef.current.on("disconnect", () => {
      setStatus("Déconnecté");
    });

    socketRef.current.on(
      "room:update",
      (data: { roomId: string; players: string[]; category: string }) => {
        console.log("📡 Room update:", data);
        setPlayers(data.players);
        setMessage(`Room ${data.roomId}: ${data.players.join(", ")}`);
        setCategory(data.category);
      },
    );

    return () => {
      socketRef.current?.off("room:update");
      socketRef.current?.disconnect();
    };
  }, []);

  const leaveRoom = () => {
    if (!socketRef.current) return;

    socketRef.current.emit(
      "room:leave",
      roomId,
      (response: { ok: boolean; roomId?: string; error?: string }) => {
        console.log("🚪 Réponse leave:", response);
        if (response.ok) {
          setMessage(`🚶 Tu as quitté la room: ${response.roomId}`);
          setRoomId("");
          setCategory("");
          setPlayers([]);
          localStorage.removeItem("roomId");
          localStorage.removeItem("pseudo");
        } else {
          setMessage(`❌ Erreur: ${response.error}`);
        }
      },
    );
  };
  return (
    <div className={styles.roomHeaderContainer}>
      <h2>Find the word associate to this definition</h2>
      <p>
        "One of the largest land carnivores of all time, known for its powerful
        jaws and tiny arms."
      </p>
      <Timer />
      <button onClick={leaveRoom}>Quitter la room</button>
    </div>
  );
};

export default RoomHeader;
