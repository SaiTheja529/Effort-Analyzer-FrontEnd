import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import Loader from "../components/Loader";
import {
  exchangeGithubCode,
  fetchGithubUser,
  loginLocalUser,
  registerLocalUser,
} from "../api/auth";
import { clearToken, getStoredUser } from "../auth/token";
import "./Login.css";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [githubLoading, setGithubLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [profile, setProfile] = useState(getStoredUser());
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const exchangedRef = useRef(false);

  const params = new URLSearchParams(location.search);
  const code = params.get("code");

  const redirectUri = useMemo(
    () => `${window.location.origin}/login`,
    []
  );

  const clientId =
    import.meta.env.VITE_GITHUB_CLIENT_ID || "Ov23liw5gI5s2yGKOyeC";

  useEffect(() => {
    const run = async () => {
      if (!code || exchangedRef.current) return;
      exchangedRef.current = true;
      // remove code from URL immediately to prevent reuse/double calls
      window.history.replaceState({}, document.title, "/login");
      setGithubLoading(true);
      setError("");
      try {
        const tokenRes = await exchangeGithubCode(code, redirectUri);
        // set token immediately so /auth/github/me has Bearer header
        login(tokenRes.access_token, null);
        const user = await fetchGithubUser();
        login(tokenRes.access_token, user);
        setProfile(user);
        navigate("/analyze", { replace: true });
      } catch (err) {
        setError(err.message);
        clearToken();
      } finally {
        setGithubLoading(false);
      }
    };
    run();
  }, [code, redirectUri, navigate]);

  const handleGithubLogin = () => {
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user`;
    window.location.href = oauthUrl;
  };

  const handleInputChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleLocalSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLocalLoading(true);

    try {
      const payload = {
        email: form.email,
        password: form.password,
      };
      if (authMode === "register") {
        payload.name = form.name;
      }

      const authResponse =
        authMode === "register"
          ? await registerLocalUser(payload)
          : await loginLocalUser(payload);

      login(authResponse.access_token, authResponse.user);
      setProfile(authResponse.user);
      navigate("/analyze", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const isBusy = githubLoading || localLoading;
  const profileName = profile?.name || profile?.login || profile?.email || "User";
  const profileHandle =
    profile?.provider === "local"
      ? profile?.email
      : profile?.login
        ? `@${profile.login}`
        : profile?.email || "";
  const profileInitial = profileName.charAt(0).toUpperCase();

  return (
    <div className="login">
      <Card
        title="Sign In"
        subtitle="Use email/password or GitHub OAuth."
        actions={
          profile && (
            <Button variant="ghost" onClick={() => navigate("/analyze")}>
              Go to Analyze
            </Button>
          )
        }
      >
        {githubLoading ? (
          <Loader message="Finalizing login..." />
        ) : profile ? (
          <div className="profile">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profileName} />
            ) : (
              <div className="profile-fallback">{profileInitial}</div>
            )}
            <div>
              <strong>{profileName}</strong>
              {profileHandle && <p>{profileHandle}</p>}
              <Button variant="secondary" onClick={() => navigate("/analyze")}>
                Continue to Analyze
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-toggle">
              <button
                type="button"
                className={`auth-toggle-btn ${authMode === "login" ? "active" : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-toggle-btn ${authMode === "register" ? "active" : ""}`}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>
            <form className="local-auth-form" onSubmit={handleLocalSubmit}>
              {authMode === "register" && (
                <Input
                  label="Name (optional)"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleInputChange("name")}
                  maxLength={120}
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleInputChange("email")}
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleInputChange("password")}
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <Button type="submit" disabled={isBusy}>
                {localLoading
                  ? authMode === "register"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "register"
                    ? "Create Account"
                    : "Login with Email"}
              </Button>
            </form>
            <div className="login-divider">
              <span>or</span>
            </div>
            <Button
              variant="secondary"
              onClick={handleGithubLogin}
              disabled={isBusy}
            >
              Login with GitHub
            </Button>
            <p className="muted">
              GitHub login redirects you to OAuth and exchanges the code on the backend.
            </p>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </Card>
    </div>
  );
};

export default Login;
