import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../context/AuthContext";
import { loginWithEmail } from "../services/auth";

const toMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/invalid-credential") {
      return "Email or password is incorrect.";
    }

    if (error.code === "auth/too-many-requests") {
      return "Too many attempts. Try again shortly.";
    }
  }

  return "Unable to sign in. Check your details and try again.";
};

export const LoginPage = () => {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname ?? "/dashboard";

  if (firebaseUser && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      try {
        await refreshProfile();
        navigate(from, { replace: true });
      } catch {
        navigate("/register", { replace: true });
      }
    } catch (nextError) {
      setError(toMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Sign in</h2>
      <p>Use your CuraSure account to continue to your workspace.</p>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            autoComplete="email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            autoComplete="current-password"
            minLength={6}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="auth-switch">
        New to CuraSure? <Link to="/register">Create an account</Link>
      </div>
    </div>
  );
};
