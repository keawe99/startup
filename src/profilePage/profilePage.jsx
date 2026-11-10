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
    <div className="container">
      <div className="profile-header">
        <Avatar url={profile.profilePicUrl} name={profile.username} size={96} />
        <div>
          <h2>{profile.username}</h2>
          <p>
            {profile.posts.length}{" "}
            {profile.posts.length === 1 ? "photo" : "photos"}
          </p>
        </div>
      </div>

      {profile.posts.length === 0 ? (
        <p>No photos yet.</p>
      ) : (
        <div className="profile-grid">
          {profile.posts.map((post) => (
            <img
              key={post._id}
              src={post.imageUrl}
              alt={post.description || `Photo by ${profile.username}`}
              className="profile-photo"
            />
          ))}
        </div>
      )}

      <p className="profile-back">
        <Link to="/landingPage">Back to feed</Link>
      </p>
    </div>
  );
};

export default ProfilePage;
