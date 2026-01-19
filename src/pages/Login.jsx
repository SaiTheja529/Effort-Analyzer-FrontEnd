import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { exchangeGithubCode, fetchGithubUser } from "../api/auth";
import { clearToken, getStoredUser } from "../auth/token";
import "./Login.css";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(getStoredUser());
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
      setLoading(true);
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
        setLoading(false);
      }
    };
    run();
  }, [code, redirectUri, navigate]);

  const handleLogin = () => {
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="login">
      <Card
        title="GitHub Login"
        subtitle="Authenticate via OAuth to use protected features."
        actions={
          profile && (
            <Button variant="ghost" onClick={() => navigate("/analyze")}>
              Go to Analyze
            </Button>
          )
        }
      >
        {loading ? (
          <Loader message="Finalizing login..." />
        ) : profile ? (
          <div className="profile">
            <img src={profile.avatar_url} alt={profile.login} />
            <div>
              <strong>{profile.name || profile.login}</strong>
              <p>@{profile.login}</p>
              <Button variant="secondary" onClick={() => navigate("/analyze")}>
                Continue to Analyze
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="muted">
              We redirect you to GitHub, then exchange the code with the backend for
              an access token. No secrets are stored in the client.
            </p>
            <Button onClick={handleLogin}>Login with GitHub</Button>
            {error && <div className="error">{error}</div>}
          </>
        )}
      </Card>
    </div>
  );
};

export default Login;
