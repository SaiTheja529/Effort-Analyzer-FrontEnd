import { useEffect, useState } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Button from "../components/Button";
import { fetchHistory } from "../api/jobs";
import "./History.css";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    load();
  }, []);

  return (
    <div className="history-page">
      <Card
        title="Analysis history"
        subtitle="All completed jobs pulled from the backend export."
      >
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
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/jobs/${h.id}?repo=${encodeURIComponent(h.repo)}`)}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default History;
