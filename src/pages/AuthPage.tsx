import { HeartPulse, Leaf, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { StatusMessage } from "../components/ui";

export function AuthPage() {
  const { token, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await signup(username, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><HeartPulse size={25} /> HealthPulse</div>
        <div className="story-copy">
          <p className="eyebrow">A calmer place for health questions</p>
          <h1>Keep your wellness notes, goals, and guidance in one private space.</h1>
          <p>General health information with clear safety guidance, source support, and control over what gets saved.</p>
        </div>
        <div className="story-points">
          <span><ShieldCheck size={19} /> You control saved context</span>
          <span><Leaf size={19} /> Simple daily wellness tracking</span>
          <span><LockKeyhole size={19} /> Passwords protected by Supabase Auth</span>
        </div>
        <p className="auth-disclaimer">HealthPulse is educational and does not replace professional medical care.</p>
      </section>

      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="segmented-control auth-tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
          </div>
          <div>
            <p className="eyebrow">{mode === "login" ? "Welcome back" : "Start your space"}</p>
            <h2>{mode === "login" ? "Sign in to HealthPulse" : "Create your account"}</h2>
            <p>{mode === "login" ? "Use your username and password to continue." : "No email is needed for this project."}</p>
          </div>
          {error && <StatusMessage>{error}</StatusMessage>}
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={32} pattern="[A-Za-z0-9_-]+" required autoComplete="username" placeholder="healthpulse_user" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={72} required autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" />
          </label>
          <button className="primary-button full-button" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
