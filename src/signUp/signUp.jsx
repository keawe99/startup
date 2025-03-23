import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form data submitted:", formData); // Log the form data
    try {
      const response = await fetch("/api/auth/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log("Signup response:", response); // Log the response
      if (response.ok) {
        const data = await response.json();
        navigate("/username", { state: { email: data.email } });
      } else {
        const errorData = await response.json();
        setError(errorData.msg || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleChange = (event) => {
    const { type, name, value, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });
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
