import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DinoSVG from "../../assets/svg/DinoSVG";
import { SocketContext } from "../../context/socketProvider";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();

  const { socketId } = useContext(SocketContext);
  console.log("🚀 ~ Header ~ socketId:", socketId);

  return (
    <header className={styles.header}>
      <p>{socketId ? "✅ Connecté" : "❌ Déconnecté"}</p>
      <div className={styles.headerContent} onClick={() => navigate("/")}>
        <DinoSVG />
        <h1>DICODINO</h1>
      </div>
    </header>
  );
};

export default Header;
