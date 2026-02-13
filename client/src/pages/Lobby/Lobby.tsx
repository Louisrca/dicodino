import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpinButton from "../../components/SpinButton/SpinButton";
import { SocketContext } from "../../context/socketProvider";
import styles from "./Lobby.module.css";
import type { Player } from "../../types/players";
import { useGameStart } from "../../api/lobby/useStartGame";

const Lobby = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();

  const { startGame } = useGameStart();

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
      console.log("🚀 ~ handleRoomUpdate ~ data:", data);
      if (data.roomId === roomId || data.roomId === roomIdState) {
        setPlayers(data.players || []);
        setCategory(data.category || "");
      }
    };

    const handleGameStarted = (data: {
      message: string;
      id: string;
      round: string;
      definition: string;
    }) => {
      console.log("🚀 ~ handleGameStarted ~ data:", data);
      if (data.id === roomId) {
        startGame(roomId);
        navigate(`/room/${data.id}`);
      }
    };

    socket.on("room:gameStarted", handleGameStarted);

    socket.on("room:update", handleRoomUpdate);
  }, [socket, roomId, roomIdState]);

  // créer un hook pour leave room
  const handleLeave = () => {
    socket?.emit(
      "room:leave",
      roomId || roomIdState,
      (response: { ok: boolean; error?: string }) => {
        if (response.ok) {
          localStorage.removeItem("player");
          navigate("/");
        } else {
          console.error("Error leaving room:", response.error);
        }
      },
    );
  };

  // créer un hook pour start game
  const handleStartGame = () => {
    if (!roomId) return;
    startGame(roomId);
  };

  if (!roomId) {
    return (
      <div className={styles.errorPage}>
        <p className={styles.errorMessage}>Room introuvable</p>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Lobby</h2>
        <p className={styles.subtitle}>En attente des joueurs...</p>
        <span className={styles.roomId}>
          Room ID: <span className={styles.roomIdValue}>{roomId}</span>
        </span>
        <hr className={styles.divider} />
        <h3 className={styles.sectionTitle}>Catégorie: {category}</h3>
        <p className={styles.meta}>Nombre de joueurs: {players.length}</p>
        <p className={styles.meta}>Joueurs présents :</p>
        <ul className={styles.playerList}>
          {players.map((player, index) => (
            <li
              key={player.id || index}
              className={
                player.username?.toLowerCase() ===
                localStoragePlayer.username?.toLowerCase()
                  ? styles.playerItemYou
                  : styles.playerItem
              }
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
    </div>
  );
};

export default Lobby;
