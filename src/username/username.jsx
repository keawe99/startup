import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

const Username = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form Data:", formData); // Replace with your logic

    navigate("/landingPage"); // Navigate to landing page
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
        Create a Username and Password
      </h3>
      <center>
        <form
          className="styled-form"
          onSubmit={handleSubmit} // Add onSubmit handler
        >
          <label htmlFor="Username">Username </label>
          <input
            type="text"
            id="Username"
            name="Username-id"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="Password">Password </label>
          <input
            type="password"
            id="Password"
            name="Password"
            onChange={handleChange} // Add onChange handler
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
