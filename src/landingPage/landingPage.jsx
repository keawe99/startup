import React from "react";
import { Link } from "react-router-dom";
import "../styles.css"; // Or the correct path to your CSS

const LandingPage = () => {
  return (
    <div className="background">
      <div className="container">
        <div className="column">
          <h2 className="heading">Latest Drops</h2>
          <ul>
            <li>
              Air Jordan 5 <br />
              "Black Metallic" <br />
              SNKRS <br />
              2/12/2025
            </li>
            <br />
            <li>
              Air Jordan 1 Low <br />
              "Game Royal" <br />
              SNKRS <br />
              12/4/2024
            </li>
            <br />
            <li>
              New Balance <br />
              "Action Bronson" <br />
              NB <br />
              11/23/2024
            </li>
            <br />
            <li>
              Adidas Gazelle <br />
              "Bad Bunny" <br />
              <a href="https://Adidas.com" style={{ color: "white" }}>
                Adidas.com
              </a>
              <br />
              10/31/2024
            </li>
          </ul>
        </div>
        <div className="column">
          <img
            alt="profilePic"
            src="https://images.wsj.net/im-322538/?width=700&height=467"
            style={{ borderRadius: "100%", height: "30px", width: "35px" }}
          />
          <div style={{ color: "white" }}>DjSneakerHead</div>
          <br />
          <br />
          <br />
          <center>
            <img
              alt="AJ5"
              src="https://cms-cdn.thesolesupplier.co.uk/2024/10/untitled1-1.png.webp"
              style={{ height: "350px", width: "600px" }}
            />
            <br />
            <br />
          </center>
          <div style={{ color: "white" }}>DjSneakerHead</div>
          <p>
            "THE WAIT IS OVER! 😱🔥 Just secured my pair of the Air Jordan 5
            Black Metallic — dropping in a few weeks but I got them early!!!
            🙌👟 The hype is REAL, and these are going straight to the top of my
            collection! Who else is ready to rock these iconic kicks?? 😎🔥
            #SneakerheadGoals #AJ5BlackMetallic #ReleaseDayHype #DreamSneakers"
          </p>
          <a href="" style={{ color: "white" }}>
            View Comments
          </a>
          <br />
          <br />
          <br />
          <img
            alt="profilePic"
            src="https://i.pinimg.com/736x/b9/2b/f3/b92bf3be5a6ace92a326c8aa486ec839.jpg"
            style={{ borderRadius: "100%", height: "30px", width: "35px" }}
          />
          <div style={{ color: "white" }}>WdDarren</div>
          <br />
          <br />
          <br />
          <center>
            <img
              alt="Travis Scott"
              src="https://www.nicekicks.com/files/2023/09/Travis-Scott-Nike-Sharkidon-release-date-lead.jpg"
              style={{ height: "350px", width: "600px" }}
            />
            <br />
            <br />
          </center>
          <div style={{ color: "white" }}>WdDarren</div>
          <p>
            🚨 NEW TRAVIS SCOTT SNEAKERS DROPPING IN A FEW WEEKS! 🚨
            <br />
            The *Cactus Jack* vibes are STRONG with these 🔥!
            <br />
            Can't wait to rock these on release day! 😎🙌👟
            <br />
            Who’s ready to cop? 💥 #TravisScott #CactusJack #SneakerGoals
            #ReleaseDayHype
          </p>
          <a href="" style={{ color: "white" }}>
            View Comments
          </a>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
        <div className="column">
          <h3 className="heading" style={{ textAlign: "right" }}>
            Welcome User!
          </h3>
          <Link to="/">
            {" "}
            {/* Use Link for navigation */}
            <img
              alt="SneakPeek360 Small Logo"
              src="/SneakPeek360Logo.png" // Correct path
              style={{
                borderRadius: "100%",
                height: "150px",
                width: "150px",
                justifyContent: "right",
                marginLeft: "50px",
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
