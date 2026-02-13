import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/socketProvider";
import { useCreateRoom } from "../../api/createRoom/useCreateRoom";
import SpinButton from "../../components/SpinButton/SpinButton";
import styles from "./CreateRoom.module.css";
import CategoryChoice from "../../components/categoryChoice/CategoryChoice";

const CreateRoom = () => {
  const [category, setCategory] = useState("dino");
  console.log("🚀 ~ CreateRoom ~ category:", category);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<Error | null>(null);

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
    createRoom({ username, category }).catch((err) => {
      console.error("Error creating room:", err);

      setError(err);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Créer une room</h1>
        <p className={styles.subtitle}>Choisis une catégorie et ton pseudo</p>
        {error && (
          <div className={styles.error}>
            <p>Erreur lors de la création de la room : {error.message}</p>
          </div>
        )}
        <form className={styles.form}>
          <input
            className={styles.input}
            placeholder="Pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <CategoryChoice
            onCategorySelect={(cat) => setCategory(cat)}
            categoryChoiced={category}
          />
          <div className={styles.buttonWrap}>
            <SpinButton
              title="Créer"
              variant="primary"
              handleAction={handleCreateRoom}
              isSpinning={false}
            />
          </div>
          <div className={styles.buttonWrap}>
            <SpinButton
              title="Retour à l'accueil"
              variant="tertiary"
              href="/"
              isSpinning={false}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
