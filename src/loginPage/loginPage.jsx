import React, { useState } from "react";
import { loginUser, logoutUser } from "./loginService";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

export default function LoginPage({ setUsername }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser(formData);
      setUsername(data.email); // Or data.username if you send that back from the server
      navigate("/landingPage");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div>
      <Link to="/">
        <img alt="backarrow" src="/backarrow.png" className="arrow-image" />
      </Link>
      <center>
        <img
          alt="SneakPeek360 Logo"
          src="/SneakPeekLogo.png"
          style={{ width: "900px", height: "500px" }}
        />
      </center>
      <br />
      <br />
      <h3 className="heading" style={{ textAlign: "center" }}>
        Login
      </h3>
      <center>
        <form
          className="styled-form"
          style={{ padding: "20px" }}
          onSubmit={handleSubmit}
        >
          <label htmlFor="username">Username </label>{" "}
          {/* Changed to username */}
          <br />
          <input
            type="text"
            id="username"
            name="username" // Changed to username
            onChange={handleChange}
          />
          <br /> <br />
          <label htmlFor="Password">Password </label> <br />
          <input
            type="password"
            id="Password"
            name="Password"
            onChange={handleChange}
          />
          <br /> <br />
          {error && (
            <div className="error-message" style={{ color: "red" }}>
              {error}
              {error === "Unauthorized" && (
                <p>
                  Don't have an account? <Link to="/signup">Sign up here</Link>.
                </p>
              )}
            </div>
          )}
          <button type="submit">Submit</button>
        </form>
      </center>
    </div>
  );
}
