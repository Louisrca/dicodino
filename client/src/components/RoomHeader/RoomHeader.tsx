import Timer from "../Timer/Timer";
import styles from "./RoomHeader.module.css";

const RoomHeader = ({ definition }: { definition: string }) => {
  return (
    <div className={styles.roomHeaderContainer}>
      <h2>Find the word associate to this definition</h2>
      <p>{definition}</p>
      <Timer />
    </div>
  );
};

export default RoomHeader;
