import React, { useState } from "react";
import { loginUser } from "./loginService";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginUser(formData);
      // Password was right. Next: enter an authenticator code, or (first
      // login with MFA) scan the QR code to set the app up.
      navigate("/mfa", {
        state: {
          challengeToken: result.challengeToken,
          mode: result.mfaSetupRequired ? "setup" : "verify",
        },
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <div className="auth-page">
      <Link to="/" aria-label="Back to home">
        <img alt="" src="/backarrow.png" className="arrow-image" />
      </Link>
      <img alt="SneakPeek360 Logo" src="/SneakPeekLogo.png" className="auth-logo" />
      <h2 className="auth-title">Log in</h2>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            required
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            onChange={handleChange}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Checking..." : "Continue"}
        </button>
      </form>

      <p className="auth-footer">
        New here? <Link to="/signUp">Create an account</Link>
      </p>
    </div>
  );
}
