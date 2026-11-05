import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";

// Turns 20230815 into "Aug 15, 2023"
const formatReleaseDate = (value) => {
  const str = String(value || "");
  if (str.length !== 8) return "N/A";
  const date = new Date(
    Number(str.slice(0, 4)),
    Number(str.slice(4, 6)) - 1,
    Number(str.slice(6, 8))
  );
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LatestDrops = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState("yeezy"); // what the user types
  const [searchTerm, setSearchTerm] = useState("yeezy"); // what we actually search

  // Wait 1 second after the user stops typing before updating searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue.trim());
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setSearchResults(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const encodedSearchTerm = encodeURIComponent(searchTerm);

        const response = await axios.get(
          `http://localhost:4001/api/sneakers?searchTerm=${encodedSearchTerm}`
        );

        console.log("Backend API Response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          // Corrected access here
          // Newest releases first; items with no release date go last
          const sorted = [...response.data].sort(
            (a, b) =>
              (b.release_date_unix || 0) - (a.release_date_unix || 0)
          );
          setSearchResults(sorted);
        } else {
          setError(new Error("Invalid API response format"));
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="latest-drops-container">
      <h2>Sneaker Search Results</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for sneakers..."
          value={inputValue}
          onChange={handleSearchChange}
        />
      </div>
      <br />
      <br />
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error.message}</div>}
      {searchResults &&
        searchResults.map((sneaker) => (
          <div key={sneaker._id} className="sneaker-card">
            {sneaker.variantImageUrl && (
              <img
                src={sneaker.variantImageUrl}
                alt={sneaker.productTitle}
                className="sneaker-image"
              />
            )}
            <h3 className="sneaker-name">{sneaker.productTitle}</h3>
            <h4>Style ID: {sneaker.model_no}</h4>
            <h4>Release Date: {formatReleaseDate(sneaker.release_date)}</h4>
            <h4>Gender: {sneaker.gender}</h4>
            <h4>Lowest Price: ${sneaker.lowest_price} USD</h4>
            <h4>Highest Price: ${sneaker.highest_price} USD</h4>
          </div>
        ))}
    </div>
  );
};

export default LatestDrops;
