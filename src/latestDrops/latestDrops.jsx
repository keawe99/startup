import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";

const LatestDrops = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    "yeezy, nike, puma, on, hoka, adidas, new balance, ugg"
  ); // Example search term

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:4001/api/sneakers?searchTerm=${searchTerm}`
        );
        console.log("Backend API Response:", response.data);
        setSearchResults(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="latest-drops-container">
      <h2>Sneaker Search Results</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for sneakers..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <br />
      <br />
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error.message}</div>}
      {searchResults &&
        searchResults.map((sneaker) => (
          <div key={sneaker.uuid} className="sneaker-card">
            {sneaker.media.imageUrl && (
              <img
                src={sneaker.media.imageUrl}
                alt={sneaker.title}
                className="sneaker-image"
              />
            )}
            <h3 className="sneaker-name">{sneaker.title}</h3>
            <p>Colorway: {sneaker.colorway}</p>
            <p>Release Date: {sneaker.releaseDate}</p>
            <p>Retail Price: {sneaker.retailPrice}</p>
            <p>Style ID: {sneaker.styleId}</p>
          </div>
        ))}
    </div>
  );
};

export default LatestDrops;
