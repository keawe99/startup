import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Avatar } from "../landingPage/landingPage.jsx";
import "../styles.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with the server limit

// Accept / decline list shown on your own profile
const FollowRequests = ({ onAnswered }) => {
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/follow-requests")
      .then(({ data }) => {
        if (!cancelled) setRequests(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const answer = async (username, action) => {
    setBusy(username);
    try {
      await axios.post(
        `/api/follow-requests/${encodeURIComponent(username)}/${action}`,
      );
      setRequests((prev) => prev.filter((r) => r.username !== username));
      onAnswered(); // follower count may have changed
    } catch {
      // leave the row in place so the user can try again
    } finally {
      setBusy("");
    }
  };

  if (requests.length === 0) return null;

  return (
    <section className="follow-requests">
      <h3>Follow requests ({requests.length})</h3>
      <ul>
        {requests.map((r) => (
          <li key={r.username} className="follow-request">
            <Link to={`/profile/${encodeURIComponent(r.username)}`}>
              <Avatar url={r.profilePicUrl} name={r.username} size={36} />
              <span>{r.username}</span>
            </Link>
            <div className="follow-request-actions">
              <button
                type="button"
                disabled={busy === r.username}
                onClick={() => answer(r.username, "accept")}
              >
                Accept
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={busy === r.username}
                onClick={() => answer(r.username, "decline")}
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Your current followers, each with a Remove button (own profile only)
const FollowersList = ({ onChanged }) => {
  const [followers, setFollowers] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/followers")
      .then(({ data }) => {
        if (!cancelled) setFollowers(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your followers.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (username) => {
    if (
      !window.confirm(
        `Remove ${username} as a follower? They will stop seeing your photos.`,
      )
    ) {
      return;
    }
    setBusy(username);
    setError("");
    try {
      await axios.delete(`/api/followers/${encodeURIComponent(username)}`);
      setFollowers((prev) => prev.filter((f) => f.username !== username));
      onChanged(); // follower count changed
    } catch {
      setError("Could not remove that follower, try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="follow-requests">
      <h3>Followers</h3>
      {error && <p className="form-error">{error}</p>}
      {followers && followers.length === 0 && (
        <p className="muted-text">No followers yet.</p>
      )}
      <ul>
        {(followers || []).map((f) => (
          <li key={f.username} className="follow-request">
            <Link to={`/profile/${encodeURIComponent(f.username)}`}>
              <Avatar url={f.profilePicUrl} name={f.username} size={36} />
              <span>{f.username}</span>
            </Link>
            <button
              type="button"
              className="button-secondary"
              disabled={busy === f.username}
              onClick={() => remove(f.username)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// currentUsername is the logged-in user; setProfilePicUrl keeps App's copy of
// their picture in sync after a change.
const ProfilePage = ({ currentUsername, setProfilePicUrl }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showFollowers, setShowFollowers] = useState(false);
  const fileInputRef = useRef(null);

  const profileUrl = `/api/users/${encodeURIComponent(username)}/posts`;

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setError("");
    setPicError("");
    setActionError("");

    axios
      .get(profileUrl)
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.response?.status === 404
            ? "No user with that username."
            : "Could not load this profile, try again.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [profileUrl]);

  // Re-read the profile (counts, locked state) after a follow action
  const refresh = async () => {
    try {
      const { data } = await axios.get(profileUrl);
      setProfile(data);
    } catch {
      // keep what is on screen
    }
  };

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
      const { data } = await axios.post(
        "/api/upload/profile-picture",
        formData,
      );
      setProfile((prev) => ({ ...prev, profilePicUrl: data.profilePicUrl }));
      if (setProfilePicUrl) setProfilePicUrl(data.profilePicUrl);
    } catch (err) {
      setPicError(err.response?.data?.error || "Upload failed, try again");
    } finally {
      setUploadingPic(false);
    }
  };

  const toggleFollow = async () => {
    const { relationship } = profile;
    // Unfollowing a private account locks its photos again
    if (
      relationship === "following" &&
      profile.isPrivate &&
      !window.confirm(
        `Unfollow ${profile.username}? You won't see their photos unless they approve you again.`,
      )
    ) {
      return;
    }

    setActionBusy(true);
    setActionError("");
    try {
      const url = `/api/users/${encodeURIComponent(profile.username)}/follow`;
      if (relationship === "none") await axios.post(url);
      else await axios.delete(url); // unfollow or cancel the request
      await refresh();
    } catch {
      setActionError("That didn't work, try again.");
    } finally {
      setActionBusy(false);
    }
  };

  const togglePrivate = async () => {
    setActionBusy(true);
    setActionError("");
    try {
      const { data } = await axios.put("/api/users/me/privacy", {
        isPrivate: !profile.isPrivate,
      });
      setProfile((prev) => ({ ...prev, isPrivate: data.isPrivate }));
      if (!data.isPrivate) await refresh(); // pending requests were approved
    } catch {
      setActionError("Could not change privacy, try again.");
    } finally {
      setActionBusy(false);
    }
  };

  if (!profile) return null;

  // Only your own profile can change its picture
  const isMe = profile.relationship === "self";
  const followLabel = {
    none: "Follow",
    requested: "Requested",
    following: "Following",
  }[profile.relationship];

  return (
    <div className="container profile-page">
      <Link
        to="/landingPage"
        aria-label="Back to feed"
        className="profile-back-arrow"
      >
        <img alt="" src="/backarrow.png" className="arrow-image" />
      </Link>
      <div className="profile-header">
        <Avatar url={profile.profilePicUrl} name={profile.username} size={96} />
        <div>
          <h2>
            {profile.username}
            {profile.isPrivate && (
              <span className="private-badge" title="Private account">
                Private
              </span>
            )}
          </h2>
          <p className="profile-stats">
            <span>
              <strong>{profile.postCount}</strong>{" "}
              {profile.postCount === 1 ? "photo" : "photos"}
            </span>
            {isMe ? (
              // Your own followers are a button: it opens the list you can edit
              <button
                type="button"
                className="btn btn-link stat-link"
                onClick={() => setShowFollowers((open) => !open)}
                aria-expanded={showFollowers}
              >
                <strong>{profile.followerCount}</strong>{" "}
                {profile.followerCount === 1 ? "follower" : "followers"}
              </button>
            ) : (
              <span>
                <strong>{profile.followerCount}</strong>{" "}
                {profile.followerCount === 1 ? "follower" : "followers"}
              </span>
            )}
            <span>
              <strong>{profile.followingCount}</strong> following
            </span>
          </p>

          {isMe ? (
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
              </button>{" "}
              <button
                type="button"
                className="button-secondary"
                onClick={togglePrivate}
                disabled={actionBusy}
                aria-pressed={profile.isPrivate}
              >
                {profile.isPrivate ? "Private: on" : "Private: off"}
              </button>
              {picError && <p className="form-error">{picError}</p>}
            </div>
          ) : (
            <div className="profile-actions">
              <button
                type="button"
                className={
                  profile.relationship === "none" ? "" : "button-secondary"
                }
                onClick={toggleFollow}
                disabled={actionBusy}
              >
                {followLabel}
              </button>
            </div>
          )}
          {actionError && <p className="form-error">{actionError}</p>}
        </div>
      </div>

      {isMe && <FollowRequests onAnswered={refresh} />}
      {isMe && showFollowers && <FollowersList onChanged={refresh} />}

      {profile.locked ? (
        <div className="locked-profile">
          <p>This account is private.</p>
          <p className="muted-text">
            {profile.relationship === "requested"
              ? "Your follow request is waiting for approval."
              : "Follow this account to see their photos."}
          </p>
        </div>
      ) : profile.posts.length === 0 ? (
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
    </div>
  );
};

export default ProfilePage;
