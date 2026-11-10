import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../loginPage/loginService";
import "../styles.css";
import axios from "axios";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with the server limit

// A user's picture, or a circle with their first initial if they have none
const Avatar = ({ url, name, size = 40 }) => {
  const style = { width: size, height: size };
  if (url) {
    return (
      <img
        alt={`${name || "User"}'s profile`}
        src={url}
        className="profile-pic"
        style={style}
      />
    );
  }
  return (
    <div
      className="profile-pic profile-pic-fallback"
      style={{ ...style, fontSize: size * 0.45 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
};

const LandingPage = ({
  username,
  setUsername,
  onLogout,
  profilePicUrl,
  setProfilePicUrl,
}) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pendingLikes, setPendingLikes] = useState(() => new Set());
  const [uploadingPic, setUploadingPic] = useState(false);
  const [profileError, setProfileError] = useState("");
  const fileInputRef = useRef(null);

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
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.type === "newPost") {
        // Skip it if the initial fetch already included this post
        setPosts((prev) =>
          prev.some((p) => p._id === message.post._id)
            ? prev
            : [message.post, ...prev]
        );
      } else if (message.type === "likeUpdate") {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === message.postId ? { ...p, likeCount: message.likeCount } : p
          )
        );
      } else if (message.type === "profileUpdate") {
        setPosts((prev) =>
          prev.map((p) =>
            p.userId === message.userId
              ? { ...p, profilePicUrl: message.profilePicUrl }
              : p
          )
        );
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Flip the like on screen right away, then confirm with the server
  const flipLike = (postId) =>
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
            }
          : p
      )
    );

  const handleLike = async (postId) => {
    if (pendingLikes.has(postId)) return; // ignore double clicks
    setPendingLikes((prev) => new Set(prev).add(postId));
    flipLike(postId);
    try {
      const { data } = await axios.post(`/api/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likedByMe: data.liked, likeCount: data.likeCount }
            : p
        )
      );
    } catch (error) {
      console.error("Like failed:", error);
      flipLike(postId); // undo
    } finally {
      setPendingLikes((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // lets the user pick the same file again later
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setProfileError("Image must be 5 MB or smaller");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingPic(true);
    setProfileError("");
    try {
      const { data } = await axios.post("/api/upload/profile-picture", formData);
      setProfilePicUrl(data.profilePicUrl);
    } catch (error) {
      setProfileError(error.response?.data?.error || "Upload failed, try again");
    } finally {
      setUploadingPic(false);
    }
  };

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
          <div key={post._id} className="post">
            <div className="post-header">
              <Avatar url={post.profilePicUrl} name={post.username} />
              <div className="username">{post.username || "Unknown user"}</div>
            </div>
            <img
              alt="Uploaded Image"
              src={post.imageUrl}
              className="post-image"
            />
            <div className="post-content">
              <div className="like-row">
                <button
                  type="button"
                  className={`like-button${post.likedByMe ? " liked" : ""}`}
                  onClick={() => handleLike(post._id)}
                  disabled={pendingLikes.has(post._id)}
                  aria-pressed={post.likedByMe}
                  aria-label={post.likedByMe ? "Unlike this post" : "Like this post"}
                >
                  {post.likedByMe ? "♥" : "♡"}
                </button>
                <span className="like-count">
                  {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
                </span>
              </div>
              <p>{post.description}</p>
              <a href="#" className="view-comments">
                View Comments
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="user-info-column">
        <div className="my-profile">
          <Avatar url={profilePicUrl} name={username} size={96} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleProfilePicChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPic}
          >
            {uploadingPic
              ? "Uploading..."
              : profilePicUrl
                ? "Change profile picture"
                : "Add profile picture"}
          </button>
          {profileError && <p className="form-error">{profileError}</p>}
        </div>
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
