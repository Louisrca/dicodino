import { useState } from "react";
import SpinButton from "../../components/SpinButton/SpinButton";
import style from "./Home.module.css";

const Home = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <div className={style.home}>
      <h1>
        Welcome to <span className="dicodino-title">DICODINO</span>
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
