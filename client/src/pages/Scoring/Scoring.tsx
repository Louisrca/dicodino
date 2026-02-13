import { useParams } from "react-router-dom";
import { useRoundResults } from "../../api/roundResults/useRoundResults";
import { useEffect, useState } from "react";
import styles from "./Scoring.module.css";

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
  const [scoreResults, setScoreResults] = useState<RoundScore[]>([]);

  useEffect(() => {
    if (!roomId) return;

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
    playerScores.length > 0
      ? playerScores.reduce((prev, current) =>
          current.finalScore > prev.finalScore ? current : prev,
        )
      : null;

  if (playerScores.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Chargement du score…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Scoring</h1>
        <p className={styles.subtitle}>Résultat de la partie</p>

        {winner && (
          <p className={styles.winner}>🏆 Gagnant : {winner.username}</p>
        )}

        <hr className={styles.divider} />

        <h2 className={styles.sectionTitle}>Scores</h2>
        <ul className={styles.playerList}>
          {playerScores.map((playerScore) => (
            <li key={playerScore.id} className={styles.playerItem}>
              <span className={styles.playerName}>{playerScore.username}</span>
              <span className={styles.playerScore}>
                {playerScore.initialScore}
                {playerScore.pointsWon > 0 && (
                  <span className={styles.pointsWon}>
                    {" "}
                    +{playerScore.pointsWon}
                  </span>
                )}{" "}
                → {playerScore.finalScore}
              </span>
            </li>
          ))}
        </ul>

        <hr className={styles.divider} />

        <h2 className={styles.sectionTitle}>Historique</h2>
        <ul className={styles.historyList}>
          {scoreResults.map((round) => (
            <li key={round.roundNumber} className={styles.historyItem}>
              <div className={styles.historyRound}>
                Round {round.roundNumber}
              </div>
              <div className={styles.historyMeta}>
                {round.definition}
              </div>
              <div className={styles.historyMeta}>
                Réponse : {round.answer}
              </div>
              <div className={styles.historyMeta}>
                Gagnant : {round.playerUsername ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Scoring;
