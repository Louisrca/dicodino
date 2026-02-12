import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/socketProvider";
import type { Player } from "../../types/players";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);

  const joinRoom = () => {
    if (!socket) return;

    socket.emit(
      "room:join",
      username,
      roomId,
      (response: {
        ok: boolean;
        roomId?: string;
        error?: string;
        player: Player;
      }) => {
        if (response.ok && response.roomId) {
          const existingPlayer = JSON.parse(localStorage.getItem("player")!);

          if (existingPlayer) {
            localStorage.removeItem("player");
          }

          localStorage.setItem(
            "player",
            JSON.stringify({ ...response.player, roomId: response.roomId }),
          );

          navigate(`/lobby/${response.roomId}`);
        } else {
          setError(`❌ Erreur: ${response.error}`);
        }
      },
    );
  };
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Test Socket.IO</h1>

      <h2>Rejoindre une room</h2>
      <input
        placeholder="Pseudo"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
