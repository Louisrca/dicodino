import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketProvider";
import { useCreateRoom } from "../../api/createRoom/api";

const CreateRoom = () => {
  const [category, setCategory] = useState("");
  const [username, setUsername] = useState("");

  const { createRoom } = useCreateRoom();

  const { socket } = useContext(SocketContext);
  useEffect(() => {
    socket?.on(
      "room:update",
      (data: { roomId: string; players: string[]; category: string }) => {
        setCategory(data.category);
      },
    );

    return () => {
      socket?.off("room:update");
    };
  }, [socket]);

  const handleCreateRoom = () => {
    createRoom({ username, category });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Créer une room</h2>
      <input
        placeholder="Pseudo"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Catégorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Créer</button>
    </div>
  );
};

export default CreateRoom;
