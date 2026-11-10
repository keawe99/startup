import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Avatar } from "../landingPage/landingPage.jsx";
import "../styles.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with the server limit

// currentUsername is the logged-in user; setProfilePicUrl keeps App's copy of
// their picture in sync after a change.
const ProfilePage = ({ currentUsername, setProfilePicUrl }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setError("");
    setPicError("");

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

  const handlePicChange = async (event) => {
    const file = event.target.files[0];
    event.target.value = ""; // lets the user pick the same file again later
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setPicError("Image must be 5 MB or smaller");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingPic(true);
    setPicError("");
    try {
      const { data } = await axios.post("/api/upload/profile-picture", formData);
      setProfile((prev) => ({ ...prev, profilePicUrl: data.profilePicUrl }));
      if (setProfilePicUrl) setProfilePicUrl(data.profilePicUrl);
    } catch (err) {
      setPicError(err.response?.data?.error || "Upload failed, try again");
    } finally {
      setUploadingPic(false);
    }
  };

  if (error) {
    return (
      <div className="container text-center">
        <p className="form-error">{error}</p>
        <Link to="/landingPage">Back to feed</Link>
      </div>
    );
  }
  if (!profile) return null;

  // Only your own profile can change its picture
  const isMe = Boolean(currentUsername) && currentUsername === profile.username;

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
          {isMe && (
            <div className="profile-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePicChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPic}
              >
                {uploadingPic
                  ? "Uploading..."
                  : profile.profilePicUrl
                    ? "Change profile picture"
                    : "Add profile picture"}
              </button>
              {picError && <p className="form-error">{picError}</p>}
            </div>
          )}
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
