import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles.css"; // Or the correct path to your CSS

const SignUp = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({}); // Store form data

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    // Process form data (e.g., send to API, store in state)
    console.log("Form Data:", formData);

    // Navigate to the username page
    navigate("/verification");
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <div className="background">
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
        Sign Up
      </h3>
      <center>
        <form
          className="styled-form-sign-up"
          style={{ padding: "20px" }}
          onSubmit={handleSubmit} // Add onSubmit handler
        >
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="birthday">Date of Birth</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="shoes">Shoe Preference</label> <br /> <br />
          <label htmlFor="nike">Nike</label>
          <input
            type="checkbox"
            id="nike"
            name="nike"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="adidas">Adidas</label>
          <input
            type="checkbox"
            id="adidas"
            name="adidas"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="nb">New Balance</label>
          <input
            type="checkbox"
            id="nb"
            name="nb"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="yeezy">Yeezy</label>
          <input
            type="checkbox"
            id="yeezy"
            name="yeezy"
            onChange={handleChange} // Add onChange handler
          />
          <br /> <br />
          <label htmlFor="puma">Puma</label>
          <input
            type="checkbox"
            id="puma"
            name="puma"
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

export default SignUp;
