import { useState } from "react";

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [round, setRound] = useState(1);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const countdown = () => {
    if (timeLeft > 0) {
      setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }

    if (timeLeft === 0) {
      setRound(round + 1);
      setTimeLeft(60);
    }

    if (round > 5) {
      // Handle end of game logic here
      //   alert("Game Over! Thanks for playing.");
      //   setRound(1);
    }
  };

  countdown();

  return (
    <div style={{ color: "#fffce1", fontSize: "1.2rem", margin: "1rem" }}>
      Time left: {formatTime(timeLeft)} | Round: {round}
    </div>
  );
};

export default Timer;
