import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Avatar } from "../landingPage/landingPage.jsx";
import "../styles.css";

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setError("");

    axios
      .get(`/api/users/${encodeURIComponent(username)}/posts`)
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.response?.status === 404
            ? "No user with that username."
            : "Could not load this profile, try again."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (error) {
    return (
      <div className="container text-center">
        <p className="form-error">{error}</p>
        <Link to="/landingPage">Back to feed</Link>
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div className="container" style={{ color: "white" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <Avatar url={profile.profilePicUrl} name={profile.username} size={96} />
        <div>
          <h2 style={{ margin: 0 }}>{profile.username}</h2>
          <p style={{ margin: 0 }}>
            {profile.posts.length}{" "}
            {profile.posts.length === 1 ? "photo" : "photos"}
          </p>
        </div>
      </div>

      {profile.posts.length === 0 ? (
        <p>No photos yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {profile.posts.map((post) => (
            <img
              key={post._id}
              src={post.imageUrl}
              alt={post.description || `Photo by ${profile.username}`}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
            />
          ))}
        </div>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/landingPage">Back to feed</Link>
      </p>
    </div>
  );
};

export default ProfilePage;
