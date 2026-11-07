import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../loginPage/loginService";
import "../styles.css";
import axios from "axios";

const LandingPage = ({ username, setUsername, onLogout }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching initial posts:", error);
      }
    };

    fetchPosts();

    // Created inside the effect so there is exactly one connection per mount
    // (a socket in the component body opened a new one on every render).
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "newPost") {
        setPosts((prevPosts) => [message.post, ...prevPosts]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUsername(null);
      if (onLogout) onLogout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="landing-page-container">
      <div className="feed-container">
        {posts.map((post) => (
          <div key={post._id || post.imageUrl} className="post">
            <div className="post-header">
              {/* Replace with actual user profile image if available */}
              <img
                alt="profilePic"
                src="https://images.wsj.net/im-322538/?width=700&height=467"
                className="profile-pic"
              />
              <div className="username">{post.username || "Unknown user"}</div>
            </div>
            <img
              alt="Uploaded Image"
              src={post.imageUrl} // Use the imageUrl from the post object
              className="post-image"
            />
            <div className="post-content">
              <p>{post.description}</p>
              <a href="#" className="view-comments">
                View Comments
              </a>
            </div>
          </div>
        ))}
        {/* You can remove the hardcoded posts now */}
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
