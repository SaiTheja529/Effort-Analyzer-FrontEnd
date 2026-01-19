import { useState } from "react";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import {
  fetchRepoContext,
  fetchRepoExplanation,
  getRepoContext,
} from "../api/explain";
import "./Summary.css";

const Summary = () => {
  const [repo, setRepo] = useState("");
  const [detail, setDetail] = useState("deep");
  const [context, setContext] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repo.trim()) {
      setError("Please enter a repository (e.g., owner/repo).");
      return;
    }
    setError("");
    setLoading(true);
    setContext(null);
    setExplanation(null);

    try {
      const repoFullName = repo.trim();
      const meta = await fetchRepoContext(repoFullName);
      let contextDetails = null;
      try {
        contextDetails = await getRepoContext(repoFullName);
      } catch {
        contextDetails = null;
      }
      setContext({ ...meta, ...contextDetails });
      const exp = await fetchRepoExplanation(repoFullName, detail);
      setExplanation(exp.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderList = (items) => {
    if (!items || items.length === 0) return <span className="muted">—</span>;
    return (
      <div className="pill-row">
        {items.map((t) => (
          <span key={t} className="pill">
            {t}
          </span>
        ))}
      </div>
    );
  };

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
        blocks.push({ type: "h3", text: headingMatch[1] });
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
      if (b.type === "h3") return <h3 key={idx}>{b.text}</h3>;
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
    <div className="summary-page">
      <Card
        title="Gemini project explanation"
        subtitle="Fetch repo context then let Gemini craft a structured overview."
      >
        <form className="summary-form" onSubmit={handleSubmit}>
          <Input
            label="Repository full name"
            placeholder="owner/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <label className="input-wrapper">
            <span className="input-label">Detail level</span>
            <select
              className="input-field"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            >
              <option value="shallow">Shallow (fast)</option>
              <option value="deep">Deep (richer)</option>
            </select>
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Explain repository"}
          </Button>
        </form>
        {error && <div className="error">{error}</div>}
        {loading && <Loader message="Calling Gemini..." />}
      </Card>

      {context && (
        <Card
          title="Repository context"
          subtitle="Stored context pulled from the backend."
        >
          <div className="context-grid">
            <div>
              <p className="muted">Repository</p>
              <strong>{context.repo_full_name}</strong>
            </div>
            <div>
              <p className="muted">Topics</p>
              {renderList(context.topics || [])}
            </div>
            <div>
              <p className="muted">Languages</p>
              <div className="pill-row">
                {context.languages
                  ? Object.entries(context.languages).map(([lang, pct]) => (
                      <span key={lang} className="pill">
                        {lang}: {pct}
                      </span>
                    ))
                  : "—"}
              </div>
            </div>
            {context.readme_excerpt && (
              <div className="readme">
                <p className="muted">README excerpt</p>
                <pre>{context.readme_excerpt}</pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {explanation && (
        <Card
          title="Gemini summary"
          subtitle="Freshly generated project explanation"
        >
          <div className="explanation">
            {explanation.overview ? (
              <div className="prose">{renderFormatted(explanation.overview)}</div>
            ) : (
              <pre>{JSON.stringify(explanation, null, 2)}</pre>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Summary;
