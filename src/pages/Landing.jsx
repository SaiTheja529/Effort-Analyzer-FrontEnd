import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import CommitRushGame from "../components/CommitRushGame";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const [gameStage, setGameStage] = useState("prompt");
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    if (gameStage === "playing" && gameRef.current) {
      gameRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [gameStage]);

  const goToGame = () => {
    setGameScore(0);
    setGameStage("playing");
  };

  const handleGameDone = (score) => {
    setGameScore(score);
    setGameStage("done");
  };

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="pill-tag">AI-powered GitHub insights</div>
          <h1>
            Effort Analyzer
            <span className="gradient-text"> for engineering teams</span>
          </h1>
          <p>
            Measure developer effort with real commit stats, Gemini summaries, and
            background jobs that keep your repositories in sync. Designed for fast,
            safe GitHub analysis.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate("/analyze")}>Analyze Repository</Button>
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Login with GitHub
            </Button>
          </div>
          <div className="hero-meta">
            <div>
              <strong>Async jobs</strong>
              <span>Pollable statuses & progress</span>
            </div>
            <div>
              <strong>AI summaries</strong>
              <span>Commit-level and project context</span>
            </div>
            <div>
              <strong>Secure OAuth</strong>
              <span>GitHub login via backend</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <Card title="How it works" subtitle="3-step pipeline">
            <ol className="steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Send a repo</strong>
                  <p>Kick off a background analysis with your repo and commit limit.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Poll the job</strong>
                  <p>Track queued → running → succeeded and see progress in real time.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Read the insights</strong>
                  <p>Review effort scores, AI summaries, and per-developer rankings.</p>
                </div>
              </li>
            </ol>
          </Card>
        </div>
      </section>

      <section className="landing-game" ref={gameRef}>
        {gameStage === "prompt" && (
          <Card
            title="Need a quick break?"
            subtitle="Before analysis, take a short refresh if you want."
          >
            <div className="game-prompt">
              <p>Want to refresh yourself by playing a game?</p>
              <div className="game-prompt-actions">
                <Button onClick={goToGame}>Yes, take me to the game</Button>
                <Button variant="secondary" onClick={() => setGameStage("idle")}>
                  Maybe later
                </Button>
              </div>
            </div>
          </Card>
        )}

        {gameStage === "idle" && (
          <Card
            title="Commit Rush"
            subtitle="Play anytime for a quick brain refresh."
          >
            <div className="game-result">
              <p>Game is waiting whenever you want a quick break.</p>
              <div className="game-result-actions">
                <Button onClick={goToGame}>Play now</Button>
              </div>
            </div>
          </Card>
        )}

        {gameStage === "playing" && (
          <Card
            title="Commit Rush"
            subtitle="Mini game: catch commits, dodge bugs."
          >
            <CommitRushGame autoStart onGameComplete={handleGameDone} />
          </Card>
        )}

        {gameStage === "done" && (
          <Card
            title="Game complete"
            subtitle="Nice run."
          >
            <div className="game-result">
              <p>
                Hurrah! Your score is <strong>{gameScore}</strong>.
              </p>
              <div className="game-result-actions">
                <Button onClick={goToGame}>Play again</Button>
                <Button variant="secondary" onClick={() => navigate("/analyze")}>
                  Continue to Analyze
                </Button>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Landing;
