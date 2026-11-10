import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Avatar } from "../landingPage/landingPage.jsx";
import "../styles.css";

const SearchPage = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null); // null = nothing searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search 300 ms after the user stops typing. The cleanup also cancels
  // any in-flight request so a slow old answer can't overwrite a newer one.
  useEffect(() => {
    const term = input.trim();
    if (!term) {
      setResults(null);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get("/api/users/search", {
          params: { q: term },
        });
        if (cancelled) return;
        setResults(data);
        setError("");
      } catch {
        if (!cancelled) setError("Search failed, try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input]);

  return (
    <div className="container search-page">
      <h2>Find sneakerheads</h2>
      <input
        type="search"
        className="search-input"
        placeholder="Search usernames..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={30}
        autoFocus
        aria-label="Search usernames"
      />

      {error && <p className="form-error">{error}</p>}
      {loading && !results && <p className="search-status">Searching...</p>}
      {results && results.length === 0 && !loading && (
        <p className="search-status">No users match "{input.trim()}".</p>
      )}

      {results && results.length > 0 && (
        <ul className="search-results">
          {results.map((user) => (
            <li key={user.username}>
              <Link
                to={`/profile/${encodeURIComponent(user.username)}`}
                className="search-result"
              >
                <Avatar url={user.profilePicUrl} name={user.username} />
                <span>{user.username}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchPage;
