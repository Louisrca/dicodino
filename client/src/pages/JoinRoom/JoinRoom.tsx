import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketProvider";
import { useJoinRoom } from "../../api/joinRoom/useJoinRoom";
import SpinButton from "../../components/SpinButton/SpinButton";
import styles from "./JoinRoom.module.css";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const { joinRoom } = useJoinRoom();

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    socket?.on("room:update", (data: { roomId: string; players: string[] }) => {
      setRoomId(data.roomId);
    });

    return () => {
      socket?.off("room:update");
    };
  }, [socket]);

  const handleJoinRoom = () => {
    joinRoom({ username, roomId }).catch((err) => {
      console.error("Error joining room:", err);
      setError(err);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Rejoindre une room</h1>
        <p className={styles.subtitle}>Entre ton pseudo et l’ID de la room</p>
        {error && (
          <div className={styles.error}>
            <p>
              Erreur lors de la tentative de rejoindre la room : {error.message}
            </p>
          </div>
        )}
        <form className={styles.form}>
          <input
            className={styles.input}
            placeholder="Pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className={styles.input}
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <div className={styles.buttonWrap}>
            <SpinButton
              title="Rejoindre"
              variant="primary"
              handleAction={handleJoinRoom}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
