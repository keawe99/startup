import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../loginPage/loginService";
import "../styles.css";

const LandingPage = ({ username, setUsername }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const socket = new WebSocket("ws://localhost:4000/ws");

  useEffect(() => {
    console.log("Username prop in LandingPage:", username);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "newPost") {
        setPosts((prevPosts) => [message.post, ...prevPosts]); // Add new post to the beginning
      }
    };

    return () => {
      socket.close();
    };
  }, [username]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUsername(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="landing-page-container">
      <div className="feed-container">
        <div className="post">
          <div className="post-header">
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
        <h3 className="heading">Welcome {username || "User!"}!</h3>
        <button onClick={handleLogout}>Logout</button>
        <Link to="/uploadPhoto">
          <button>Upload Photo</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
