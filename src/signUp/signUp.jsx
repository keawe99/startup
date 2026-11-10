import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

// name = the field the server stores, label = what the user sees
const BRANDS = [
  { name: "nike", label: "Nike" },
  { name: "adidas", label: "Adidas" },
  { name: "nb", label: "New Balance" },
  { name: "yeezy", label: "Yeezy" },
  { name: "puma", label: "Puma" },
];

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        navigate("/username", { state: { email: data.email } });
      } else if (response.status === 409) {
        setError("An account with that email already exists.");
      } else {
        setError(data.msg || "Sign up failed, try again.");
      }
    } catch {
      setError("Network error, check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { type, name, value, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="auth-page">
      <Link to="/" aria-label="Back to home">
        <img alt="" src="/backarrow.png" className="arrow-image" />
      </Link>
      <img alt="SneakPeek360 Logo" src="/SneakPeekLogo.png" className="auth-logo" />
      <h2 className="auth-title">Create your account</h2>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            required
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="birthday">Date of birth</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            autoComplete="bday"
            required
            onChange={handleChange}
          />
        </div>

        <fieldset className="field">
          <legend>Shoe preferences</legend>
          <div className="chip-group">
            {BRANDS.map(({ name, label }) => (
              <label key={name} className="chip">
                <input type="checkbox" name={name} onChange={handleChange} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Continue"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/loginPage">Log in</Link>
      </p>
    </div>
  );
};

export default SignUp;
