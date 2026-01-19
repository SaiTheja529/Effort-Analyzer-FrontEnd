import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Button from "../components/Button";
import { fetchRankings, fetchHistory } from "../api/jobs";
import "./Leaders.css";

const Leaders = () => {
  const [repo, setRepo] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        const succeeded = (data.jobs || []).filter((j) => j.status === "succeeded");
        const rows = succeeded
          .map((j) => j.input?.repo_full_name)
          .filter(Boolean);
        setHistory(Array.from(new Set(rows)));
        if (rows.length > 0 && !repo) {
          setRepo(rows[0]);
        }
      } catch {
        // ignore
      }
    };
    loadHistory();
  }, [repo]);

  const maxEffort = useMemo(
    () => (rankings.length ? Math.max(...rankings.map((r) => r.effort)) : 1),
    [rankings]
  );

  const loadRankings = async (e) => {
    if (e) e.preventDefault();
    if (!repo.trim()) {
      setError("Enter a repository first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchRankings(repo.trim());
      setRankings(data);
    } catch (err) {
      setError(err.message);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaders-page">
      <Card
        title="Top contributors"
        subtitle="Visual effort distribution by developer."
      >
        <form className="leaders-form" onSubmit={loadRankings}>
          <Input
            label="Repository"
            placeholder="owner/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            list="repo-history"
          />
          <datalist id="repo-history">
            {history.map((h) => (
              <option value={h} key={h} />
            ))}
          </datalist>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Show leaders"}
          </Button>
        </form>
        {error && <div className="error">{error}</div>}
        {loading && <Loader message="Pulling rankings..." />}
        {!loading && rankings.length === 0 && !error && (
          <p className="muted">No rankings yet. Run an analysis first.</p>
        )}
        {!loading && rankings.length > 0 && (
          <div className="bar-chart">
            {rankings.map((r, idx) => {
              const percent = (r.effort / maxEffort) * 100;
              return (
                <div key={r.developer} className="bar-row">
                  <div className="bar-label">
                    <span className="rank-dot">{idx + 1}</span>
                    <span className="dev-name">{r.developer}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(percent, 6)}%` }}
                    >
                      <span className="bar-value">{r.effort.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leaders;
