import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpinButton from "../../components/SpinButton/SpinButton";
import { SocketContext } from "../../context/socketProvider";
import styles from "./Lobby.module.css";
import type { Player } from "../../types/players";

const Lobby = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const localStoragePlayer = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );

  const roomId = lobbyId;

  const [category, setCategory] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomIdState, setRoomIdState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!roomId) return;

    //créer un hook pour fetch lobby info (players, category) et l'appeler ici
    void (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8081/api/dicodino/lobby/${roomId}`,
        );
        if (!res.ok) throw new Error("Room not found");
        const data = await res.json();

        setPlayers(data.players || []);
        setRoomIdState(data.id || roomId);
        setCategory(data.category || "");
      } catch (err) {
        console.error("Error fetching lobby:", err);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }

      return () => {
        setPlayers([]);
      };
    })();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data: {
      roomId: string;
      players: Player[];
      category: string;
    }) => {
      if (data.roomId === roomId || data.roomId === roomIdState) {
        setPlayers(data.players || []);
        setCategory(data.category || "");
      }
    };

    socket.on("room:update", handleRoomUpdate);

    const handleGameStart = (data: { message: string }) => {
      console.log("Game started:", data.message);
      navigate(`/room/${roomId}`);
    };

    socket.on("room:gameStarted", handleGameStart);

    return () => {
      socket.off("room:update", handleRoomUpdate);
      socket.off("room:gameStarted", handleGameStart);
    };
  }, [socket, roomId, roomIdState]);

  // créer un hook pour leave room
  const handleLeave = () => {
    socket?.emit(
      "room:leave",
      roomId || roomIdState,
      (response: { ok: boolean; error?: string }) => {
        if (response.ok) {
          localStorage.removeItem("roomId");
          localStorage.removeItem("username");
          navigate("/");
        } else {
          console.error("Error leaving room:", response.error);
        }
      },
    );
  };

  // créer un hook pour start game
  const handleStartGame = () => {
    socket?.emit(
      "room:gameStart",
      roomId,
      (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          console.error("Error starting game:", response.error);
        }
      },
    );
  };

  if (!roomId) {
    return (
      <div>
        <p style={{ color: "red" }}>Room introuvable</p>
        <button onClick={() => navigate("/")}>Retour à l'accueil</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h2>Lobby</h2>
      <span style={{ fontSize: "12px" }}>
        Room ID:
        <span
          style={{
            fontWeight: "bold",
            color: "#fffce1",
            textTransform: "uppercase",
          }}
        >
          {roomId}
        </span>
      </span>
      <hr />
      <h3>Catégorie: {category}</h3>
      <p style={{ fontSize: "12px", color: "#888" }}>
        Nombre de joueurs: {players.length}
      </p>
      <p style={{ fontSize: "12px", color: "#888" }}>Pseudos en cours:</p>
      <ul>
        {players.map((player, index) => (
          <li
            key={player.id || index}
            style={{
              fontSize: "12px",
              color:
                player.username?.toLowerCase() ===
                localStoragePlayer.username?.toLowerCase()
                  ? "#0f0"
                  : "#fffce1",
            }}
          >
            {player.username}{" "}
            {player.username?.toLowerCase() ===
              localStoragePlayer.username?.toLowerCase() && "(vous)"}
          </li>
        ))}
      </ul>
      <div className={styles.lobbyButtonsContainer}>
        {localStoragePlayer.isHost && (
          <SpinButton
            disabled={players.length < 2}
            title="Lancer la partie"
            variant="primary"
            handleAction={handleStartGame}
          />
        )}
        <SpinButton
          handleAction={handleLeave}
          title="Quitter la room"
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default Lobby;
