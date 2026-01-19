import "./StatusPill.css";

const mapStatus = {
  queued: "queued",
  running: "running",
  succeeded: "success",
  failed: "danger",
};

const StatusPill = ({ status }) => {
  const tone = mapStatus[status] || "queued";
  return <span className={`pill pill-${tone}`}>{status}</span>;
};

export default StatusPill;
