import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../context/AuthContext";
import { registerWithEmail, syncCurrentProfile } from "../services/auth";
import type { AppRole } from "../types/auth";

const roleOptions: Array<{ label: string; value: AppRole }> = [
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
  { label: "Insurance provider", value: "insurance_provider" },
  { label: "Admin", value: "admin" }
];

const toMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/email-already-in-use") {
      return "An account already exists for this email.";
    }

    if (error.code === "auth/weak-password") {
      return "Use a password with at least 6 characters.";
    }
  }

  return "Unable to create account. Check your details and try again.";
};

export const RegisterPage = () => {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("patient");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (firebaseUser && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!firebaseUser) {
        await registerWithEmail(email, password);
      }

      await syncCurrentProfile(role);
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (nextError) {
      setError(toMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create account</h2>
      <p>Select the workspace that matches how you will use CuraSure.</p>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        {!firebaseUser && (
          <>
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
                autoComplete="new-password"
                minLength={6}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(event) => setRole(event.target.value as AppRole)}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <div className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};
