import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const Verification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Verification Code:", formData); // Replace with your logic

    navigate("/landingPage"); // Navigate to landing page
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div className="background">
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "xx-large",
          color: "white",
        }}
      >
        Verify it's you
      </h2>
      <br />
      <br />
      <br />
      <center>
        <form
          className="styled-form-verification"
          onSubmit={handleSubmit} // Add onSubmit handler
        >
          <h4>Input the code we just sent you</h4>
          <div className="segmented-input">
            <input
              type="text"
              id="code1"
              name="code1"
              maxLength="1"
              autoFocus
              onChange={handleChange} // Add onChange handler
            />
            <input
              type="text"
              id="code2"
              name="code2"
              maxLength="1"
              onChange={handleChange} // Add onChange handler
            />
            <input
              type="text"
              id="code3"
              name="code3"
              maxLength="1"
              onChange={handleChange} // Add onChange handler
            />
            <input
              type="text"
              id="code4"
              name="code4"
              maxLength="1"
              onChange={handleChange} // Add onChange handler
            />
            <input
              type="text"
              id="code5"
              name="code5"
              maxLength="1"
              onChange={handleChange} // Add onChange handler
            />
            <input
              type="text"
              id="code6"
              name="code6"
              maxLength="1"
              onChange={handleChange} // Add onChange handler
            />
          </div>
          <br />
          <br />
          <button type="submit">Submit</button>
        </form>
        <footer style={{ color: "white" }}>Didn't receive a code?</footer>
      </center>
    </div>
  );
};

export default Verification;
