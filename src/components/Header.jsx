import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import "./Header.css";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/summary", label: "Summary" },
  { to: "/leaders", label: "Leaders" },
  { to: "/trends", label: "Trends" },
  { to: "/history", label: "History" },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const displayName = user?.name || user?.login || user?.email || "User";
  const secondaryText =
    user?.provider === "local"
      ? user.email
      : user?.login
        ? `@${user.login}`
        : user?.email || "";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="brand" onClick={() => navigate("/")}>
        <span className="logo-dot">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="11" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            <path
              d="M12 4.5L13.8 10.2H19.8L14.9 13.8L16.6 19.5L12 15.9L7.4 19.5L9.1 13.8L4.2 10.2H10.2L12 4.5Z"
              fill="url(#grad)"
            />
            <defs>
              <linearGradient id="grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#68d3ff" />
                <stop offset="1" stopColor="#7c5dff" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <div>
          <strong>Effort Analyzer</strong>
          <small>GitHub Insights</small>
        </div>
      </div>
      <nav className="nav">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${isActive(item.to) ? "nav-active" : ""}`}
          >
            <span className="nav-underline" />
            {item.label}
          </Link>
        ))}
        <Link
          to="/jobs/last"
          className={`nav-item ${isActive("/jobs/last") ? "nav-active" : ""}`}
        >
          <span className="nav-underline" />
          Job Status
        </Link>
      </nav>
      <div className="header-actions">
        {user ? (
          <div className="user-chip">
            {user.avatar_url && (
              <img src={user.avatar_url} alt={displayName} className="user-avatar" />
            )}
            {!user.avatar_url && (
              <span className="user-avatar user-avatar-fallback">{avatarInitial}</span>
            )}
            <div>
              <span className="user-name">{displayName}</span>
              {secondaryText && <small className="user-secondary">{secondaryText}</small>}
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
