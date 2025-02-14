import React from "react";
import "../styles.css"; // Or the correct path to your CSS
import { Link } from "react-router-dom"; // Import the Link component

const AboutUs = () => {
  return (
    <div>
      <Link to="/">
        {" "}
        <img
          alt="backarrow"
          src="/backarrow.png" // Path relative to the public directory
          className="arrow-image"
          style={"width: 20px height: 20px;"}
        />
      </Link>
      <center>
        <h1>About Us</h1>
        <br />
        <br />
        <br />
        <img alt="Steve" src="/Steve.jpg" />{" "}
        {/* Path relative to the public directory */}
        <br />
        <br />
        <div style={{ color: "white", fontSize: "large" }}>
          My name is Steven Armstrong, and my journey with sneakers has taken me
          from the classrooms of Brigham Young University (Information Systems,
          <br />
          Computer Science emphasis) to the heart of sneaker culture at Nike
          (2023-2024). Working there solidified my belief in the power of the
          <br />
          sneaker community. That's why I created SneakPeek360—a platform
          inspired by the desire to connect sneakerheads globally. I'm
          passionate about creating a space where everyone can stay informed,
          trade, sell, and buy their favorite kicks. As a Utah native and
          graduating senior, I'm excited to see where this platform goes!
        </div>
      </center>
    </div>
  );
};

export default AboutUs;
