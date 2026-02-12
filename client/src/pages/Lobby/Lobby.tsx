import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SocketContext } from "../../context/socketProvider";

const Lobby = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const pseudo = localStorage.getItem("pseudo") || "Anonyme";
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const roomId = searchParams.get("roomId") || "";

  const { socket } = useContext(SocketContext);
  
  
  useEffect(() => {
    socket?.on(
      "room:update",
      (data: { roomId: string; players: string[]; category: string }) => {
        console.log("📡 Room update:", data);
        setPlayers(data.players);
        setMessage(`Room ${data.roomId}: ${data.players.join(", ")}`);
        setCategory(data.category);
      },
    );

    return () => {
      socket?.off("room:update");
    };
  }, []);

  return (
    <div>
      <h2>Lobby</h2>
      <p style={{ fontSize: "12px", color: "#888" }}>Room ID: {roomId}</p>
      <h3>Catégorie: {category}</h3>
      <p style={{ fontSize: "12px", color: "#888" }}>
        Nombre de joueurs: {players.length}
      </p>
      <p style={{ fontSize: "12px", color: "#888" }}>
        Pseudos joueurs en cours:
      </p>
      <ul>
        {players.map((playerPseudo, index) => (
          <li
            key={index}
            style={{
              fontSize: "12px",
              color: playerPseudo === pseudo ? "#0f0" : "#000",
            }}
          >
            {playerPseudo} {playerPseudo === pseudo && "(vous)"}
          </li>
        ))}
      </ul>
      <hr />

      <h2>Messages</h2>
      <p style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
        {message || "Aucun message"}
      </p>
    </div>
  );
};

export default Lobby;
