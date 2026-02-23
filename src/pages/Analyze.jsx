import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { startAnalysis } from "../api/analyze";
import { deleteHistoryEntry, fetchHistory } from "../api/jobs";
import "./Analyze.css";

const Analyze = () => {
  const navigate = useNavigate();
  const [repo, setRepo] = useState("tiangolo/fastapi");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        repo_full_name: repo.trim(),
        max_commits: Number(limit) || 5,
      };
      const res = await startAnalysis(payload);
      localStorage.setItem(
        "ea_last_job",
        JSON.stringify({ id: res.job_id, repo: payload.repo_full_name })
      );
      navigate(`/jobs/${res.job_id}?repo=${encodeURIComponent(payload.repo_full_name)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        const succeeded = (data.jobs || []).filter((j) => j.status === "succeeded");
        const rows = succeeded
          .map((j) => ({
            id: j.id,
            repo: j.input?.repo_full_name,
            at: j.updated_at || j.created_at,
            commits: j.result?.total_commits_processed ?? 0,
          }))
          .filter((r) => r.repo)
          .sort((a, b) => new Date(b.at) - new Date(a.at));
        setHistory(rows.slice(0, 8));
      } catch {
        // silent
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleDeleteHistory = async (entry) => {
    const ok = window.confirm(`Delete history for ${entry.repo}?`);
    if (!ok) return;

    setDeletingHistoryId(entry.id);
    try {
      await deleteHistoryEntry(entry.id);
      setHistory((prev) => prev.filter((row) => row.id !== entry.id));
    } catch {
      // silent
    } finally {
      setDeletingHistoryId(null);
    }
  };

  return (
    <div className="analyze">
      <Card title="Analyze a repository" subtitle="Run a background job to score commit effort.">
        <form className="analyze-form" onSubmit={handleSubmit}>
          <Input
            label="Repository (owner/name)"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
            placeholder="owner/repo"
          />
          <Input
            label="Max commits to fetch"
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            helper="Jobs stay fast for small limits; increase when ready."
          />
          <div className="actions">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader message="Starting..." /> : "Start Analysis"}
            </Button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </Card>
      <Card title="Recent analyses" subtitle="History of completed jobs.">
        {historyLoading ? (
          <Loader message="Loading history..." />
        ) : history.length === 0 ? (
          <p className="muted">No analyses yet. Run your first job above.</p>
        ) : (
          <div className="history-list">
            {history.map((h) => (
              <div key={h.id} className="history-row">
                <div>
                  <strong>{h.repo}</strong>
                  <p className="muted">
                    {new Date(h.at).toLocaleString()} · {h.commits} commits
                  </p>
                </div>
                <div className="history-row-actions">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/jobs/${h.id}?repo=${encodeURIComponent(h.repo)}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDeleteHistory(h)}
                    disabled={deletingHistoryId === h.id}
                  >
                    {deletingHistoryId === h.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analyze;
