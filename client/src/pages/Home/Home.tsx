import gsap from "gsap";
import { useContext, useEffect, useRef, useState } from "react";
import SpinButton from "../../components/SpinButton/SpinButton";
import style from "./Home.module.css";
import { SocketContext } from "../../context/socketProvider";

const Home = () => {
  const [isAnimating, setIsAnimating] = useState(false)

  
const [isInRoom, setIsInRoom] = useState(
  localStorage.getItem("player") ? true : false);

  const localStoragePlayer = JSON.parse(
    localStorage.getItem("player") || '{"username":"Anonyme"}',
  );
  const { socket } = useContext(SocketContext);

  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current) return;

    const letters = spanRef.current.querySelectorAll("span");

    gsap.to(letters, {
      y: -10,
      duration: 0.3,
      ease: "power1.inOut",
      repeat: -5,
      yoyo: true,
      stagger: 0.1,
      repeatDelay: 1,
    });
  }, []);

  const word = "DICODINO".split("").map((letter, i) => (
    <span key={i} style={{ display: "inline-block" }}>
      {letter}
    </span>
  ));


  const handleLeave = () => {

    socket?.emit(
      "room:leave",
      localStoragePlayer.roomId,
      (response: { ok: boolean; error?: string }) => {
        if (response.ok) {
          localStorage.removeItem("player");
          setIsInRoom(false);
        } else {
          console.error("Error leaving room:", response.error);
        }
      },
    );
  };

  return (
    <div className={style.home}>
      <h1>
        Welcome to{" "}
        <span ref={spanRef} className={style.dicodinoTitle}>
          {word}
        </span>
      </h1>

{
  isInRoom && (
    <button className={style.currentDefinition} onClick={handleLeave}>
        leave current room
      </button>
  )}

      

      <div className={style.buttonsContainer}>
        <SpinButton
          title="Join a game"
          variant="primary"
          href="/joinRoom"
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
        />
        <SpinButton
          title="Create a game"
          variant="secondary"
          href="/createRoom"
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
        />
      </div>
    </div>
  );
};

export default Home;
