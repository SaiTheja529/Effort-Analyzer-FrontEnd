import { useEffect, useState } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Button from "../components/Button";
import { clearAllHistory, deleteHistoryEntry, fetchHistory } from "../api/jobs";
import "./History.css";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await fetchHistory();
      const succeeded = (data.jobs || []).filter((j) => j.status === "succeeded");
      const rows = succeeded
        .map((j) => ({
          id: j.id,
          repo: j.input?.repo_full_name,
          at: j.updated_at || j.created_at,
          commits: j.result?.total_commits_processed ?? 0,
          status: j.status,
        }))
        .filter((r) => r.repo)
        .sort((a, b) => new Date(b.at) - new Date(a.at));
      setEntries(rows);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (entry) => {
    const ok = window.confirm(`Delete history for ${entry.repo}?`);
    if (!ok) return;

    setError("");
    setDeletingId(entry.id);
    try {
      await deleteHistoryEntry(entry.id);
      setEntries((prev) => prev.filter((row) => row.id !== entry.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (entries.length === 0) return;
    const ok = window.confirm("Delete all analysis history?");
    if (!ok) return;

    setError("");
    setClearing(true);
    try {
      await clearAllHistory();
      setEntries([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="history-page">
      <Card
        title="Analysis history"
        subtitle="All completed jobs pulled from the backend export."
        actions={
          <Button
            variant="secondary"
            onClick={handleClearAll}
            disabled={loading || clearing || entries.length === 0}
          >
            {clearing ? "Deleting..." : "Delete all"}
          </Button>
        }
      >
        {error && <div className="history-error">{error}</div>}
        {loading ? (
          <Loader message="Loading history..." />
        ) : entries.length === 0 ? (
          <p className="muted">No completed analyses yet.</p>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>Repository</span>
              <span>Commits</span>
              <span>Completed</span>
              <span />
            </div>
            {entries.map((h) => (
              <div key={h.id} className="history-row">
                <span className="repo">{h.repo}</span>
                <span>{h.commits}</span>
                <span>{new Date(h.at).toLocaleString()}</span>
                <div className="history-actions">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/jobs/${h.id}?repo=${encodeURIComponent(h.repo)}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(h)}
                    disabled={deletingId === h.id}
                  >
                    {deletingId === h.id ? "Deleting..." : "Delete"}
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

export default History;
