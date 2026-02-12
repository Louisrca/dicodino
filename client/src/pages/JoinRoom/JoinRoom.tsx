import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketProvider";
import { useJoinRoom } from "../../api/joinRoom/useJoinRoom";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const { joinRoom } = useJoinRoom();

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    socket?.on(
      "room:update",
      (data: { roomId: string; players: string[] }) => {
        setRoomId(data.roomId);
      },
    );

    return () => {
      socket?.off("room:update");
    };
  }, [socket]);

  const handleJoinRoom = () => {
    joinRoom({ username, roomId });
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
      <button onClick={handleJoinRoom}>Rejoindre</button>
    </div>
  );
};

export default JoinRoom;
