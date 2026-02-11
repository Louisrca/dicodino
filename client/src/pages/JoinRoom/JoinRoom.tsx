import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketProvider";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [status, setStatus] = useState("Déconnecté");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    socket?.on("connect", () => {
      setStatus("Connecté");
      console.log("✅ Connecté au serveur");
    });

    socket?.on("disconnect", () => {
      setStatus("Déconnecté");
    });

    socket?.on(
      "room:update",
      (data: { roomId: string; players: string[]; category: string }) => {
        console.log("📡 Room update:", data);
      },
    );

    return () => {
      socket?.off("room:update");
    };
  }, [socket]);

  const joinRoom = () => {
    if (!socket) return;

    socket.emit(
      "room:join",
      pseudo,
      roomId,
      (response: { ok: boolean; roomId?: string; error?: string }) => {
        console.log("🔁 Réponse join:", response);
        if (response.ok && response.roomId) {
          localStorage.setItem("roomId", response.roomId);
          localStorage.setItem("pseudo", pseudo);
          navigate(`/room/${response.roomId}`);
        } else {
          setError(`❌ Erreur: ${response.error}`);
        }
      },
    );
  };
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Test Socket.IO</h1>
      <p>Status: {status}</p>

      <h2>Rejoindre une room</h2>
      <input
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Rejoindre</button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />
    </div>
  );
};

export default JoinRoom;
