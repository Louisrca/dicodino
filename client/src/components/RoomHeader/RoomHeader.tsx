import styles from "./RoomHeader.module.css";

const RoomHeader = ({
  definition,
  round,
}: {
  definition: string;
  round: number;
}) => {
  return (
    <div className={styles.roomHeaderContainer}>
      <h2>
        Find the word associate to this definition — Round {round}/5
      </h2>
      <p>{definition}</p>
    </div>
  );
};

export default RoomHeader;
