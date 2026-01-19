import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import Loader from "../components/Loader";
import StatusPill from "../components/StatusPill";
import Button from "../components/Button";
import { fetchJobStatus, fetchCommits, fetchRankings } from "../api/jobs";
import "./JobStatus.css";

const terminalStates = ["succeeded", "failed"];

const JobStatus = () => {
  const { jobId: rawJobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const repoFromQuery = search.get("repo");

  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commits, setCommits] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (rawJobId === "last") {
      const saved = localStorage.getItem("ea_last_job");
      if (saved) {
        const parsed = JSON.parse(saved);
        setJobId(parsed.id);
      } else {
        setError("No previous job found.");
        setLoading(false);
      }
    } else {
      setJobId(rawJobId);
    }
  }, [rawJobId]);

  const repo = useMemo(() => {
    if (repoFromQuery) return repoFromQuery;
    const saved = localStorage.getItem("ea_last_job");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.repo;
    }
    return "";
  }, [repoFromQuery]);

  useEffect(() => {
    if (!jobId) return;
    let timer;
    const load = async (once = false) => {
      try {
        const data = await fetchJobStatus(jobId);
        setJob(data);
        setLoading(false);
        if (terminalStates.includes(data.status)) {
          if (timer) clearInterval(timer);
          if (data.status === "succeeded" && repo) {
            fetchCommits(repo).then(setCommits).catch(() => {});
            fetchRankings(repo).then(setRankings).catch(() => {});
          }
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (timer) clearInterval(timer);
      }
      if (once) return;
    };
    load(true);
    timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [jobId, repo]);

  if (!jobId) {
    return (
      <Card title="Job Status">
        <div className="error">Missing job id.</div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card title="Job Status">
        <Loader message="Polling job..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Job Status">
        <div className="error">{error}</div>
        <Button variant="secondary" onClick={() => navigate("/analyze")}>
          Start another analysis
        </Button>
      </Card>
    );
  }

  const progress = job?.progress || {};
  const renderFormatted = (text) => {
    if (!text) return null;
    const lines = text.split(/\r?\n/);
    const blocks = [];
    let paragraph = [];
    let bullets = [];

    const pushParagraph = () => {
      if (paragraph.length) {
        blocks.push({ type: "p", text: paragraph.join(" ") });
        paragraph = [];
      }
    };
    const pushBullets = () => {
      if (bullets.length) {
        blocks.push({ type: "ul", items: bullets });
        bullets = [];
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        pushParagraph();
        pushBullets();
        return;
      }
      const headingMatch = /^#{1,6}\s+(.*)/.exec(trimmed);
      if (headingMatch) {
        pushParagraph();
        pushBullets();
        blocks.push({ type: "h4", text: headingMatch[1] });
        return;
      }
      const bulletMatch = /^[-*•]\s+(.*)/.exec(trimmed) || /^\d+\.\s+(.*)/.exec(trimmed);
      if (bulletMatch) {
        pushParagraph();
        bullets.push(bulletMatch[1]);
        return;
      }
      paragraph.push(trimmed);
    });
    pushParagraph();
    pushBullets();

    return blocks.map((b, idx) => {
      if (b.type === "h4") return <h4 key={idx}>{b.text}</h4>;
      if (b.type === "ul")
        return (
          <ul key={idx}>
            {b.items.map((i, j) => (
              <li key={j}>{i}</li>
            ))}
          </ul>
        );
      return <p key={idx}>{b.text}</p>;
    });
  };

  return (
    <div className="job-status">
      <Card
        title={`Job #${jobId}`}
        subtitle={repo ? `Repository: ${repo}` : "Background analysis"}
        actions={<StatusPill status={job.status} />}
      >
        <div className="job-grid">
          <div>
            <p className="muted">Stage</p>
            <strong>{progress.stage || "—"}</strong>
          </div>
          <div>
            <p className="muted">Processed commits</p>
            <strong>{progress.processed_commits ?? job?.result?.total_commits_processed ?? 0}</strong>
          </div>
          <div>
            <p className="muted">Result</p>
            <strong>{job?.result?.total_commits_processed ?? "Pending"}</strong>
          </div>
        </div>
        {job.error && (
          <div className="error">
            <strong>Job failed:</strong> {job.error}
          </div>
        )}
        {terminalStates.includes(job.status) && (
          <div className="post-actions">
            <Button variant="secondary" onClick={() => navigate("/analyze")}>
              Analyze another repo
            </Button>
          </div>
        )}
      </Card>

      {job.status === "succeeded" && commits.length > 0 && (
        <Card
          title="Commit summaries"
          subtitle="AI-generated context with effort scores."
        >
          <div className="commit-list">
            {commits.map((c) => (
              <div key={c.sha} className="commit-card">
                <div className="commit-head">
                  <div>
                    <strong>{c.message.split("\n")[0]}</strong>
                    <p className="muted">{c.sha.slice(0, 10)}</p>
                  </div>
                  <span className="effort">Effort: {c.effort_score}</span>
                </div>
                <div className="commit-summary prose-lite">
                  {c.ai_summary ? renderFormatted(c.ai_summary) : "No AI summary"}
                </div>
                <div className="commit-meta">
                  <span>Added: {c.lines_added}</span>
                  <span>Deleted: {c.lines_deleted}</span>
                  <span>{new Date(c.committed_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {job.status === "succeeded" && rankings.length > 0 && (
        <Card title="Developer effort ranking">
          <div className="ranking">
            {rankings.map((r, idx) => (
              <div key={r.developer} className="ranking-row">
                <span className="rank">{idx + 1}</span>
                <span className="dev">{r.developer}</span>
                <span className="score">{r.effort.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobStatus;
