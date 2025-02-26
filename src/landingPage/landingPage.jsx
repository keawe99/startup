import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const LandingPage = ({ username }) => {
  useEffect(() => {
    // This useEffect will run when the username prop changes
    console.log("Username prop in LandingPage:", username); // Optional: Check the value
  }, [username]); // Run effect when username changes
  return (
    <div className="landing-page-container">
      {" "}
      {/* Main container */}
      <div className="feed-container">
        {" "}
        {/* Container for the feed */}
        <div className="post">
          {" "}
          {/* Individual post */}
          <div className="post-header">
            {" "}
            {/* Header with profile and name */}
            <img
              alt="profilePic"
              src="https://images.wsj.net/im-322538/?width=700&height=467"
              className="profile-pic"
            />
            <div className="username">DjSneakerHead</div>
          </div>
          <img
            alt="AJ5"
            src="https://cms-cdn.thesolesupplier.co.uk/2024/10/untitled1-1.png.webp"
            className="post-image"
          />
          <div className="post-content">
            {" "}
            {/* Content and comments link */}
            <div className="username">DjSneakerHead</div>
            <p>
              "THE WAIT IS OVER! 😱🔥 Just secured my pair of the Air Jordan 5
              Black Metallic — dropping in a few weeks but I got them early!!!
              🙌👟 The hype is REAL, and these are going straight to the top of
              my collection! Who else is ready to rock these iconic kicks?? 😎🔥
              #SneakerheadGoals #AJ5BlackMetallic #ReleaseDayHype
              #DreamSneakers"
            </p>
            <a href="#" className="view-comments">
              View Comments
            </a>
          </div>
        </div>
        {/* Repeat the post structure for other posts */}
        <div className="post">
          <div className="post-header">
            <img
              alt="profilePic"
              src="https://i.pinimg.com/736x/b9/2b/f3/b92bf3be5a6ace92a326c8aa486ec839.jpg"
              className="profile-pic"
            />
            <div className="username">WdDarren</div>
          </div>
          <img
            alt="Travis Scott"
            src="https://www.nicekicks.com/files/2023/09/Travis-Scott-Nike-Sharkidon-release-date-lead.jpg"
            className="post-image"
          />
          <div className="post-content">
            <div className="username">WdDarren</div>
            <p>
              🚨 NEW TRAVIS SCOTT SNEAKERS DROPPING IN A FEW WEEKS! 🚨 <br />
              The *Cactus Jack* vibes are STRONG with these 🔥! <br />
              Can't wait to rock these on release day! 😎🙌👟 <br />
              Who’s ready to cop? 💥 #TravisScott #CactusJack #SneakerGoals
              #ReleaseDayHype
            </p>
            <a href="#" className="view-comments">
              View Comments
            </a>
          </div>
        </div>
      </div>
      <div className="user-info-column">
        {" "}
        {/* User info on the side */}
        <h3 className="heading">Welcome {username || "User!"}!</h3>
      </div>
    </div>
  );
};

export default LandingPage;
