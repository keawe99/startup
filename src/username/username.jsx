import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles.css";

const Username = ({ setUsername }) => {
  const navigate = useNavigate();
  const [username, setUsernameInput] = useState("");
  const [password, setPasswordInput] = useState(""); // Add password state
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password, // Send password
          email: location.state.email,
        }),
      });

      if (response.ok) {
        setUsername(username);
        navigate("/landingPage");
      } else {
        alert("Failed to create username.");
      }
    } catch (err) {
      alert("Network error.");
    }
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
        Create a Username and Password
      </h3>
      <center>
        <form className="styled-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username </label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={(e) => setUsernameInput(e.target.value)}
          />
          <br /> <br />
          <label htmlFor="password">Password </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <br /> <br />
          <button style={{ position: "right" }} type="submit">
            Submit
          </button>
        </form>
      </center>
    </div>
  );
};

export default Username;
