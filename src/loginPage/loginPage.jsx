import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

export default function LoginPage({ setUsername }) {
  // Receive setUsername as prop
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Data:", formData);
    if (formData["Username-id"]) {
      // Check if username is present
      setUsername(formData["Username-id"]); // Update username state in App
      navigate("/landingPage");
    } else {
      alert("Please enter a username.");
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
          <label htmlFor="Username">Username </label>
          <br />
          <input
            type="text"
            id="Username"
            name="Username-id"
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
          <button type="submit">Submit</button>
        </form>
      </center>
    </div>
  );
}
