import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import axios from "axios";

// A user's picture, or a circle with their first initial if they have none
export const Avatar = ({ url, name, size = 40 }) => {
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

// The comments under one post: list, add box, delete buttons
const Comments = ({ postId, onCountChange }) => {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`/api/posts/${postId}/comments`)
      .then(({ data }) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.");
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    setError("");
    try {
      const { data } = await axios.post(`/api/posts/${postId}/comments`, {
        text: trimmed,
      });
      setComments((prev) => [...(prev || []), data]);
      setText("");
      onCountChange(1);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not post your comment.");
    } finally {
      setPosting(false);
    }
  };

  const remove = async (commentId) => {
    setError("");
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCountChange(-1);
    } catch {
      setError("Could not delete that comment.");
    }
  };

  return (
    <div className="comments">
      {comments === null && !error && (
        <p className="muted-text">Loading comments...</p>
      )}
      {comments && comments.length === 0 && (
        <p className="muted-text">No comments yet. Be the first.</p>
      )}
      <ul>
        {(comments || []).map((c) => (
          <li key={c._id} className="comment">
            <p>
              <Link
                to={`/profile/${encodeURIComponent(c.username)}`}
                className="comment-author"
              >
                {c.username}
              </Link>{" "}
              {c.text}
            </p>
            {c.canDelete && (
              <button
                type="button"
                className="btn btn-link comment-delete"
                onClick={() => remove(c._id)}
                aria-label={`Delete comment by ${c.username}`}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      <form className="comment-form" onSubmit={submit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          maxLength={300}
          aria-label="Add a comment"
        />
        <button type="submit" disabled={posting || !text.trim()}>
          Post
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

const LandingPage = () => {
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false); // so "empty feed" isn't flashed while loading
  const [pendingLikes, setPendingLikes] = useState(() => new Set());

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching initial posts:", error);
      } finally {
        setLoaded(true);
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

  const toggleComments = (postId) =>
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });

  const changeCommentCount = (postId, delta) =>
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) + delta) }
          : p
      )
    );

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

  return (
    <div className="landing-page-container">
      <div className="feed-container">
        {loaded && posts.length === 0 && (
          <div className="empty-feed">
            <h3>Your feed is empty</h3>
            <p>
              Photos from you and the people you follow show up here.{" "}
              <Link to="/search">Find people to follow</Link>.
            </p>
          </div>
        )}
        {posts.map((post) => (
          <div key={post._id} className="post">
            <div className="post-header">
              <Avatar url={post.profilePicUrl} name={post.username} />
              <div className="username">
                {post.username ? (
                  <Link to={`/profile/${encodeURIComponent(post.username)}`}>
                    {post.username}
                  </Link>
                ) : (
                  "Unknown user"
                )}
              </div>
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
              <button
                type="button"
                className="btn btn-link view-comments"
                onClick={() => toggleComments(post._id)}
                aria-expanded={openComments.has(post._id)}
              >
                {openComments.has(post._id)
                  ? "Hide comments"
                  : post.commentCount > 0
                    ? `View ${post.commentCount} ${post.commentCount === 1 ? "comment" : "comments"}`
                    : "Add a comment"}
              </button>
              {openComments.has(post._id) && (
                <Comments
                  postId={post._id}
                  onCountChange={(delta) => changeCommentCount(post._id, delta)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
