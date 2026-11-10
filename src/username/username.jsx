import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles.css";

const Username = ({ setUsername, onUsernameSet }) => {
  const navigate = useNavigate();
  const [username, setUsernameInput] = useState("");
  const [password, setPasswordInput] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  // Set by the sign up page; missing if someone opens /username directly
  const email = location.state?.email;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (response.ok) {
        setUsername(username);
        onUsernameSet(); // Trigger re-render in App.jsx
        navigate("/landingPage");
      } else if (response.status === 409) {
        setError("That username is taken, try another.");
      } else {
        setError("Could not create your username, try again.");
      }
    } catch {
      setError("Network error, check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" aria-label="Back to home">
        <img alt="" src="/backarrow.png" className="arrow-image" />
      </Link>
      <img alt="SneakPeek360 Logo" src="/SneakPeekLogo.png" className="auth-logo" />
      <h2 className="auth-title">Choose a username</h2>

      {!email ? (
        <p className="auth-footer">
          Start from the <Link to="/signUp">sign up page</Link> to create an
          account first.
        </p>
      ) : (
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              required
              maxLength={30}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Finish sign up"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Username;
