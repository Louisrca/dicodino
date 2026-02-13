import { useParams } from "react-router-dom";
import { useRoundResults } from "../../api/roundResults/useRoundResults";
import { useEffect, useState } from "react";

type PlayerScore = {
  id: string;
  username: string;
  initialScore: number;
  pointsWon: number;
  finalScore: number;
};

type RoundScore = {
  roundNumber: number;
  definition: string;
  playerUsername: string | null;
  answer: string;
};

const Scoring = () => {
  const { roomId } = useParams();
  const { roundResults } = useRoundResults();

  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  console.log("🚀 ~ Scoring ~ playerScores:", playerScores);
  const [scoreResults, setScoreResults] = useState<RoundScore[]>([]);
  console.log("🚀 ~ Scoring ~ scoreResults:", scoreResults);

  useEffect(() => {
    if (!roomId) {
      console.error("No room ID found in localStorage");
      return;
    }

    roundResults(roomId)
      .then((data) => {
        setPlayerScores(data.playerScores || []);
        setScoreResults(data.score || []);
      })
      .catch((err: Error) => {
        console.error("Error fetching round results:", err);
      });
  }, [roomId]);

  const winner =
    playerScores && playerScores.length > 0
      ? playerScores.reduce((prev, current) =>
          current.finalScore > prev.finalScore ? current : prev,
        )
      : null;

  if (playerScores.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Scoring</h1>
      <h2>Winner: {winner?.username}</h2>
      <p>Voici le scoring de la partie</p>
      {playerScores.map((playerScore) => (
        <div key={playerScore.username}>
          <h2>{playerScore.username}</h2>
          <p>
            {" "}
            Score: {playerScore.initialScore}{" "}
            <span>
              {playerScore.pointsWon > 0 ? `+${playerScore.pointsWon}` : 0}
            </span>
          </p>
          Final score: {playerScore.finalScore}
        </div>
      ))}

      <h2>Historique</h2>
      {scoreResults.map((round) => (
        <div key={round.roundNumber}>
          <h3>Round {round.roundNumber}</h3>
          <p>Definition: {round.definition}</p>
          <p>Answer: {round.answer}</p>
          <p>Winner: {round.playerUsername || "No winner"}</p>
        </div>
      ))}
    </div>
  );
};

export default Scoring;
