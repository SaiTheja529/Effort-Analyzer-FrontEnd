import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import "./CommitRushGame.css";

const LANES = 5;
const START_TIME = 45;
const START_LIVES = 3;
const TICK_MS = 50;
const STORAGE_KEY = "ea_commit_rush_best";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const CommitRushGame = ({ autoStart = false, onGameComplete = null }) => {
  const [bestScore, setBestScore] = useState(0);
  const [game, setGame] = useState({
    status: "idle",
    score: 0,
    lives: START_LIVES,
    timeLeft: START_TIME,
    playerLane: 2,
    streak: 0,
    runId: 0,
    objects: [],
  });

  const tickTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const nextObjectId = useRef(1);
  const runIdRef = useRef(0);
  const completedRunRef = useRef(0);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setBestScore(parsed);
    }
  }, []);

  const stopTimers = () => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  };

  const startGame = () => {
    nextObjectId.current = 1;
    runIdRef.current += 1;
    setGame({
      status: "running",
      score: 0,
      lives: START_LIVES,
      timeLeft: START_TIME,
      playerLane: 2,
      streak: 0,
      runId: runIdRef.current,
      objects: [],
    });
  };

  const movePlayer = (delta) => {
    setGame((prev) => {
      if (prev.status !== "running") return prev;
      return {
        ...prev,
        playerLane: clamp(prev.playerLane + delta, 0, LANES - 1),
      };
    });
  };

  useEffect(() => {
    if (game.status !== "running") {
      stopTimers();
      return;
    }

    const spawnObject = () => {
      setGame((prev) => {
        if (prev.status !== "running") return prev;
        const elapsed = START_TIME - prev.timeLeft;
        const bugChance = clamp(0.24 + elapsed * 0.01, 0.24, 0.58);
        const type = Math.random() < bugChance ? "bug" : "commit";
        const lane = Math.floor(Math.random() * LANES);
        const speedBase = type === "bug" ? 2.0 : 1.6;
        const speed = speedBase + elapsed * 0.03 + Math.random() * 0.6;

        return {
          ...prev,
          objects: [
            ...prev.objects,
            {
              id: nextObjectId.current++,
              lane,
              y: -10,
              type,
              speed,
            },
          ],
        };
      });
    };

    const tick = () => {
      setGame((prev) => {
        if (prev.status !== "running") return prev;

        let score = prev.score;
        let lives = prev.lives;
        let streak = prev.streak;
        const nextObjects = [];

        for (const obj of prev.objects) {
          const nextY = obj.y + obj.speed;
          const collided = nextY >= 84 && nextY <= 100 && obj.lane === prev.playerLane;

          if (collided) {
            if (obj.type === "commit") {
              const bonus = Math.min(streak, 6) * 2;
              score += 10 + bonus;
              streak += 1;
            } else {
              lives -= 1;
              streak = 0;
            }
            continue;
          }

          if (nextY > 102) {
            if (obj.type === "commit") {
              streak = 0;
            }
            continue;
          }

          nextObjects.push({ ...obj, y: nextY });
        }

        const timeLeft = Math.max(0, prev.timeLeft - TICK_MS / 1000);
        const finished = lives <= 0 || timeLeft <= 0;

        return {
          ...prev,
          status: finished ? "finished" : "running",
          score,
          lives: Math.max(0, lives),
          streak,
          timeLeft,
          objects: nextObjects,
        };
      });
    };

    spawnObject();
    spawnTimerRef.current = setInterval(spawnObject, 520);
    tickTimerRef.current = setInterval(tick, TICK_MS);

    return () => stopTimers();
  }, [game.status]);

  useEffect(() => {
    if (game.status !== "finished") return;
    if (game.score <= bestScore) return;

    setBestScore(game.score);
    localStorage.setItem(STORAGE_KEY, String(game.score));
  }, [game.status, game.score, bestScore]);

  useEffect(() => {
    if (!autoStart) return;
    if (game.status !== "idle") return;
    startGame();
  }, [autoStart, game.status]);

  useEffect(() => {
    if (game.status !== "finished") return;
    if (!onGameComplete || game.runId <= 0) return;
    if (completedRunRef.current === game.runId) return;

    completedRunRef.current = game.runId;
    onGameComplete(game.score);
  }, [game.status, game.runId, game.score, onGameComplete]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        movePlayer(-1);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        movePlayer(1);
      }
      if (event.key === " " && game.status !== "running") {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game.status]);

  const laneWidth = 100 / LANES;
  const playerLeft = (game.playerLane + 0.5) * laneWidth;

  return (
    <div className="rush">
      <div className="rush-stats">
        <div>
          <p>Score</p>
          <strong>{game.score}</strong>
        </div>
        <div>
          <p>Best</p>
          <strong>{bestScore}</strong>
        </div>
        <div>
          <p>Streak</p>
          <strong>x{Math.max(1, game.streak)}</strong>
        </div>
        <div>
          <p>Lives</p>
          <strong>{game.lives}</strong>
        </div>
        <div>
          <p>Time</p>
          <strong>{Math.ceil(game.timeLeft)}s</strong>
        </div>
      </div>

      <div className="rush-board" role="application" aria-label="Commit Rush game board">
        <div className="rush-lanes">
          {Array.from({ length: LANES }).map((_, index) => (
            <div key={index} className="rush-lane" />
          ))}
        </div>

        {game.objects.map((obj) => (
          <div
            key={obj.id}
            className={`rush-item rush-item-${obj.type}`}
            style={{
              left: `calc(${(obj.lane + 0.5) * laneWidth}% - 18px)`,
              top: `${obj.y}%`,
            }}
          >
            {obj.type === "commit" ? "C" : "B"}
          </div>
        ))}

        <div className="rush-player" style={{ left: `calc(${playerLeft}% - 22px)` }}>
          DEV
        </div>
      </div>

      <div className="rush-hud">
        <p>
          Catch <strong>commits</strong>, dodge <strong>bugs</strong>. Move with arrow keys or A/D.
        </p>
        <div className="rush-actions">
          <Button onClick={startGame}>
            {game.status === "running" ? "Restart Run" : game.status === "finished" ? "Play Again" : "Start Game"}
          </Button>
          <div className="rush-mobile-controls">
            <button
              type="button"
              className="rush-control-btn"
              onClick={() => movePlayer(-1)}
              disabled={game.status !== "running"}
            >
              Left
            </button>
            <button
              type="button"
              className="rush-control-btn"
              onClick={() => movePlayer(1)}
              disabled={game.status !== "running"}
            >
              Right
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitRushGame;
