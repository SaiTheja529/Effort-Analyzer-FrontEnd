import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InfoTooltip from "../components/InfoTooltip";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { fetchDeveloperTrends, fetchHistory } from "../api/jobs";
import "./Trends.css";

const SERIES_COLORS = [
  "#67e8f9",
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#fb7185",
  "#22d3ee",
];

const formatNumber = (value) => {
  const n = Number(value || 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const formatLabel = (isoDate, bucket) => {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  if (bucket === "week") return `${m}/${d}`;
  return `${m}/${d}`;
};

const computeDirection = (points) => {
  if (!points || points.length < 2) return "flat";
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "flat";
};

const TrendChart = ({ labels, series, bucket }) => {
  const width = 980;
  const height = 360;
  const padLeft = 52;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 44;

  const maxY = Math.max(
    1,
    ...series.flatMap((s) => s.points).map((v) => Number(v || 0))
  );

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const stepX = labels.length > 1 ? chartWidth / (labels.length - 1) : 0;
  const showPointMarkers = labels.length <= 28;

  const toX = (index) => padLeft + index * stepX;
  const toY = (value) => {
    const normalized = Number(value || 0) / maxY;
    return padTop + chartHeight - normalized * chartHeight;
  };

  const buildPath = (points) =>
    points
      .map((value, idx) => `${idx === 0 ? "M" : "L"} ${toX(idx)} ${toY(value)}`)
      .join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padTop + chartHeight - t * chartHeight,
    value: formatNumber(maxY * t),
  }));

  const xTickIndexes = (() => {
    if (labels.length <= 1) return [0];
    if (labels.length <= 8) return labels.map((_, idx) => idx);
    const middle = Math.floor((labels.length - 1) / 2);
    return [0, middle, labels.length - 1];
  })();

  return (
    <div className="trend-chart-wrap">
      <svg
        className="trend-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Developer effort trend line chart"
      >
        {yTicks.map((tick) => (
          <g key={`y-${tick.y}`}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              className="trend-grid-line"
            />
            <text x={padLeft - 8} y={tick.y + 4} className="trend-axis-label trend-axis-left">
              {tick.value}
            </text>
          </g>
        ))}

        {series.map((item, idx) => {
          const color = SERIES_COLORS[idx % SERIES_COLORS.length];
          return (
            <g key={item.developer}>
              <path d={buildPath(item.points)} stroke={color} className="trend-path" />
              {showPointMarkers &&
                item.points.map((value, pointIdx) => (
                  <circle
                    key={`${item.developer}-${pointIdx}`}
                    cx={toX(pointIdx)}
                    cy={toY(value)}
                    r="3.4"
                    fill={color}
                  />
                ))}
            </g>
          );
        })}

        {xTickIndexes.map((idx) => (
          <text
            key={`x-${idx}`}
            x={toX(idx)}
            y={height - 14}
            className="trend-axis-label trend-axis-bottom"
          >
            {formatLabel(labels[idx], bucket)}
          </text>
        ))}
      </svg>

      <div className="trend-legend">
        {series.map((item, idx) => (
          <div key={item.developer} className="trend-legend-item">
            <span
              className="trend-legend-dot"
              style={{ background: SERIES_COLORS[idx % SERIES_COLORS.length] }}
            />
            <span>{item.developer}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Trends = () => {
  const [repo, setRepo] = useState("");
  const [bucket, setBucket] = useState("week");
  const [days, setDays] = useState(84);
  const [topN, setTopN] = useState(6);
  const [repoOptions, setRepoOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState("");
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    const loadHistoryRepos = async () => {
      try {
        const data = await fetchHistory();
        const succeeded = (data.jobs || []).filter((j) => j.status === "succeeded");
        const repos = Array.from(
          new Set(
            succeeded
              .map((j) => j.input?.repo_full_name)
              .filter(Boolean)
          )
        );
        setRepoOptions(repos);
        if (repos.length > 0) {
          setRepo((prev) => prev || repos[0]);
        }
      } catch {
        // ignore initial history bootstrap failures
      } finally {
        setBootstrapping(false);
      }
    };
    loadHistoryRepos();
  }, []);

  const loadTrends = async (event) => {
    if (event) event.preventDefault();
    if (!repo.trim()) {
      setError("Enter a repository first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchDeveloperTrends(repo.trim(), {
        bucket,
        days: Number(days) || 84,
        topN: Number(topN) || 6,
      });
      setTrendData(data);
    } catch (err) {
      setError(err.message);
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bootstrapping && repo.trim()) {
      loadTrends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapping]);

  const summary = useMemo(() => {
    if (!trendData?.series?.length) {
      return {
        totalEffort: 0,
        topDeveloper: "-",
        activeDevelopers: 0,
      };
    }
    const totalEffort = trendData.series.reduce(
      (sum, s) => sum + Number(s.total_effort || 0),
      0
    );
    const topDeveloper = trendData.series[0]?.developer || "-";
    const activeDevelopers = trendData.series.length;
    return {
      totalEffort,
      topDeveloper,
      activeDevelopers,
    };
  }, [trendData]);

  const windowLabel = useMemo(() => {
    if (!trendData?.window_start || !trendData?.window_end) return "";
    return `Window used: ${trendData.window_start} to ${trendData.window_end}`;
  }, [trendData]);

  return (
    <div className="trends-page">
      <Card
        title="Developer trend dashboard"
        subtitle="Track effort movement by developer over time."
        actions={
          <InfoTooltip title="How to Read This Chart">
            <p>
              <strong>Each colored line</strong> shows one developer's effort over time.
            </p>
            <p>
              <strong>Bucket</strong> controls grouping: daily or weekly.
            </p>
            <p>
              <strong>Window (days)</strong> controls how far back we look from the repo's latest analyzed commit.
            </p>
            <p>
              <strong>Top developers</strong> limits the chart to highest total effort contributors.
            </p>
            <p>
              <strong>Direction</strong> in the table compares last bucket vs previous bucket: up, down, or flat.
            </p>
          </InfoTooltip>
        }
      >
        <form className="trends-form" onSubmit={loadTrends}>
          <Input
            label="Repository"
            placeholder="owner/repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            list="trend-repo-history"
          />
          <datalist id="trend-repo-history">
            {repoOptions.map((option) => (
              <option value={option} key={option} />
            ))}
          </datalist>

          <label className="input-wrapper">
            <span className="input-label">Bucket</span>
            <select
              className="input-field"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
            >
              <option value="week">Weekly</option>
              <option value="day">Daily</option>
            </select>
          </label>

          <Input
            label="Window (days)"
            type="number"
            min={7}
            max={365}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />

          <Input
            label="Top developers"
            type="number"
            min={1}
            max={12}
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
          />

          <Button type="submit" disabled={loading || bootstrapping}>
            {loading ? "Loading..." : "Refresh dashboard"}
          </Button>
        </form>

        {error && <div className="error">{error}</div>}
        {(loading || bootstrapping) && <Loader message="Building trend dashboard..." />}
        {!loading && !bootstrapping && windowLabel && (
          <p className="trend-window-note">{windowLabel}</p>
        )}

        {!loading && !bootstrapping && trendData && trendData.series.length === 0 && (
          <p className="muted">
            No trend data found for this repository and time window. Run an analysis first or widen the window.
          </p>
        )}

        {!loading && !bootstrapping && trendData && trendData.series.length > 0 && (
          <>
            <div className="trend-kpis">
              <div className="trend-kpi">
                <p>Total effort</p>
                <strong>{formatNumber(summary.totalEffort)}</strong>
              </div>
              <div className="trend-kpi">
                <p>Top developer</p>
                <strong>{summary.topDeveloper}</strong>
              </div>
              <div className="trend-kpi">
                <p>Active developers</p>
                <strong>{summary.activeDevelopers}</strong>
              </div>
            </div>

            <TrendChart
              labels={trendData.labels}
              series={trendData.series}
              bucket={trendData.bucket}
            />

            <div className="trend-table">
              <div className="trend-table-head">
                <span>Developer</span>
                <span>Total</span>
                <span>Avg / bucket</span>
                <span>Last bucket</span>
                <span>Direction</span>
              </div>
              {trendData.series.map((item) => {
                const points = item.points || [];
                const last = points.length ? points[points.length - 1] : 0;
                const average =
                  points.length > 0
                    ? Number(item.total_effort || 0) / points.length
                    : 0;
                return (
                  <div key={item.developer} className="trend-table-row">
                    <span>{item.developer}</span>
                    <span>{formatNumber(item.total_effort)}</span>
                    <span>{formatNumber(average)}</span>
                    <span>{formatNumber(last)}</span>
                    <span className={`trend-dir trend-dir-${computeDirection(points)}`}>
                      {computeDirection(points)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Trends;
