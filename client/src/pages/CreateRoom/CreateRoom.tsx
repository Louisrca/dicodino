import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/socketProvider";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [response, setResponse] = useState("");

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    socket?.on(
      "room:update",
      (data: { roomId: string; players: string[]; category: string }) => {
        console.log("📡 Room update:", data);
        setResponse(`Room ${data.roomId}: ${data.players.join(", ")}`);
        setCategory(data.category);
      },
    );

    return () => {
      socket?.off("room:update");
    };
  }, [socket]);

  const createRoom = () => {
    if (!socket) return;

    socket.emit(
      "room:create",
      pseudo,
      category,
      (response: { ok: boolean; roomId?: string; error?: string }) => {
        console.log("🛠️ Réponse create:", response);
        if (response.ok && response.roomId) {
          setResponse(`✅ Room créée: ${response.roomId}`);
          localStorage.setItem("roomId", response.roomId);
          localStorage.setItem("pseudo", pseudo);
          navigate(`/lobby/${response.roomId}`);
        } else {
          setResponse(`❌ Erreur: ${response.error}`);
        }
      },
    );
  };
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Test Socket.IO</h1>
      <p>Status: {status}</p>
      <p>Réponse: {response}</p>

      <hr />

      <h2>Créer une room</h2>
      <input
        placeholder="Pseudo"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
      />
      <input
        placeholder="Catégorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={createRoom}>Créer</button>
    </div>
  );
};

export default CreateRoom;
