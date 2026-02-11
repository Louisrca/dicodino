import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DinoSVG from "../../assets/svg/DinoSVG";
import MeteorSVG from "../../assets/svg/MeteorSVG";
import TreePalmSVG from "../../assets/svg/TreePalmSVG";
import { SocketContext } from "../../context/socketProvider";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();

  const { socketId } = useContext(SocketContext);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent} onClick={() => navigate("/")}>
        <DinoSVG />
        <h1>DICODINO</h1>
      </div>
      <p className={styles.connectionStatus}>
        {socketId ? (
          <>
            <TreePalmSVG
              style={{ width: "24px", height: "24px", fill: "#4caf50" }}
            />
            {"Connecté"}
          </>
        ) : (
          <>
            <MeteorSVG
              style={{ width: "24px", height: "24px", fill: "#df2413e7" }}
            />{" "}
            {"Déconnecté"}
          </>
        )}
      </p>
    </header>
  );
};

export default Header;
