import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

// Posts JSON and returns { ok, data }; never throws on HTTP errors
const postJson = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { msg: "Network error, check your connection and try again." },
    };
  }
};

// Step 2 of login and sign up. Two modes:
//   "setup":  scan a QR code with an authenticator app, confirm with a code,
//             then save the one-time recovery codes
//   "verify": enter the current code from the app (or a recovery code)
export default function MfaPage({ setUsername, onLogin }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const challengeToken = state?.challengeToken;
  const mode = state?.mode;

  const [setup, setSetup] = useState(null); // { qrDataUrl, secret }
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [finished, setFinished] = useState(null); // { username } once logged in
  const [saved, setSaved] = useState(false);

  // Setup mode: ask the server for the QR code once
  useEffect(() => {
    if (mode !== "setup" || !challengeToken) return;
    let cancelled = false;
    postJson("/api/auth/mfa/setup", { challengeToken }).then(({ ok, data }) => {
      if (cancelled) return;
      if (ok) setSetup(data);
      else setError(data.msg || "Could not start setup, try again.");
    });
    return () => {
      cancelled = true;
    };
  }, [mode, challengeToken]);

  // Opened directly (or refreshed after the 10 minute window): nothing to do
  if (!challengeToken || (mode !== "setup" && mode !== "verify")) {
    return (
      <div className="auth-page">
        <h2 className="auth-title">Session expired</h2>
        <p className="auth-footer">
          Please <Link to="/loginPage">log in</Link> or{" "}
          <Link to="/signUp">sign up</Link> to continue.
        </p>
      </div>
    );
  }

  const completeLogin = (username) => {
    setUsername(username);
    onLogin();
    navigate("/landingPage");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "setup") {
      const { ok, data } = await postJson("/api/auth/mfa/verify-setup", {
        challengeToken,
        code,
      });
      setSubmitting(false);
      if (ok) {
        // Logged in already (cookie set), but show the recovery codes first
        setRecoveryCodes(data.recoveryCodes);
        setFinished({ username: data.username });
      } else {
        setError(data.msg || "Could not verify that code.");
      }
      return;
    }

    const { ok, data } = await postJson("/api/auth/mfa/verify", {
      challengeToken,
      ...(useRecovery ? { recoveryCode: code } : { code }),
    });
    setSubmitting(false);
    if (ok) completeLogin(data.username);
    else setError(data.msg || "Could not verify that code.");
  };

  // Setup finished: show the one-time recovery codes
  if (recoveryCodes) {
    const text = recoveryCodes.join("\n");
    const download = () => {
      const url = URL.createObjectURL(
        new Blob([`SneakPeek360 recovery codes\n\n${text}\n`], { type: "text/plain" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "sneakpeek360-recovery-codes.txt";
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="auth-page">
        <h2 className="auth-title">Save your recovery codes</h2>
        <div className="auth-card">
          <p className="muted-text">
            If you lose your phone, each of these codes lets you log in once.
            They are shown only now, so store them somewhere safe.
          </p>
          <ul className="recovery-codes">
            {recoveryCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="upload-actions">
            <button type="button" className="button-secondary" onClick={download}>
              Download
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigator.clipboard?.writeText(text)}
            >
              Copy
            </button>
          </div>
          <label className="recovery-confirm">
            <input
              type="checkbox"
              checked={saved}
              onChange={(e) => setSaved(e.target.checked)}
            />{" "}
            I saved these codes
          </label>
          <button
            type="button"
            className="auth-submit"
            disabled={!saved}
            onClick={() => completeLogin(finished.username)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <img alt="SneakPeek360 Logo" src="/SneakPeekLogo.png" className="auth-logo" />
      <h2 className="auth-title">
        {mode === "setup" ? "Set up two-step login" : "Enter your code"}
      </h2>

      <form className="auth-card" onSubmit={handleSubmit}>
        {mode === "setup" && (
          <>
            <p className="muted-text">
              1. Install an authenticator app (Google Authenticator, Authy or
              1Password).
              <br />
              2. Scan this code, then enter the 6-digit code it shows.
            </p>
            {setup ? (
              <div className="mfa-qr">
                <img src={setup.qrDataUrl} alt="QR code for your authenticator app" />
                <p className="muted-text">
                  Can't scan? Enter this key by hand:
                  <br />
                  <code>{setup.secret}</code>
                </p>
              </div>
            ) : (
              !error && <p className="muted-text">Loading your code...</p>
            )}
          </>
        )}

        {mode === "verify" && (
          <p className="muted-text">
            {useRecovery
              ? "Enter one of your saved recovery codes. Each works once."
              : "Open your authenticator app and enter the 6-digit code for SneakPeek360."}
          </p>
        )}

        <div className="field">
          <label htmlFor="code">
            {useRecovery ? "Recovery code" : "6-digit code"}
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode={useRecovery ? "text" : "numeric"}
            autoComplete="one-time-code"
            maxLength={useRecovery ? 16 : 7}
            required
            autoFocus
            disabled={mode === "setup" && !setup}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-submit"
          disabled={submitting || (mode === "setup" && !setup)}
        >
          {submitting
            ? "Checking..."
            : mode === "setup"
              ? "Turn on two-step login"
              : "Log in"}
        </button>
      </form>

      {mode === "verify" && (
        <p className="auth-footer">
          <button
            type="button"
            className="btn btn-link stat-link"
            onClick={() => {
              setUseRecovery((v) => !v);
              setCode("");
              setError("");
            }}
          >
            {useRecovery ? "Use my authenticator app" : "Use a recovery code instead"}
          </button>
        </p>
      )}
    </div>
  );
}
