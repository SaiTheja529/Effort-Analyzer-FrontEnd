import { useEffect, useRef, useState } from "react";
import "./InfoTooltip.css";

const InfoTooltip = ({ title = "Info", children }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="info-tooltip" ref={rootRef}>
      <button
        type="button"
        className="info-tooltip-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={title}
      >
        ?
      </button>
      {open && (
        <div className="info-tooltip-popover" role="dialog" aria-label={title}>
          <strong>{title}</strong>
          <div className="info-tooltip-content">{children}</div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
