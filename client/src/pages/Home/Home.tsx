import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import SpinButton from "../../components/SpinButton/SpinButton";
import style from "./Home.module.css";

const Home = () => {
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <div className={style.home}>
      <h1>
        Welcome to{" "}
        <span ref={spanRef} className={style.dicodinoTitle}>
          {word}
        </span>
      </h1>

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
