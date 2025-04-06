import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../loginPage/loginService";
import "../styles.css";
import axios from "axios";

const LandingPage = ({ username, setUsername }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const socket = new WebSocket("ws://localhost:4000/ws");

  useEffect(() => {
    console.log("Username prop in LandingPage:", username);

    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching initial posts:", error);
      }
    };

    fetchPosts();

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "newPost") {
        setPosts((prevPosts) => [message.post, ...prevPosts]);
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
        {posts.map((post) => (
          <div key={post.imageUrl} className="post">
            <div className="post-header">
              {/* Replace with actual user profile image if available */}
              <img
                alt="profilePic"
                src="https://images.wsj.net/im-322538/?width=700&height=467"
                className="profile-pic"
              />
              {/* Replace with actual username associated with the post */}
              <div className="username">User ID: {post.userId}</div>
            </div>
            <img
              alt="Uploaded Image"
              src={post.imageUrl} // Use the imageUrl from the post object
              className="post-image"
            />
            <div className="post-content">
              {/* Replace with actual username */}
              <div className="username">User ID: {post.userId}</div>
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
