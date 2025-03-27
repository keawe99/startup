import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";

const LatestDrops = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("yeezy");

  useEffect(() => {
    const fetchSearchResults = async () => {
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
          setSearchResults(response.data); // Corrected access here
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
          <div key={sneaker.product_id} className="sneaker-card">
            {sneaker.image && ( // Corrected access here
              <img
                src={sneaker.image} // Corrected access here
                alt={sneaker.title}
                className="sneaker-image"
              />
            )}
            <h3 className="sneaker-name">{sneaker.title}</h3>
            <h4>Style ID: {sneaker.model_no}</h4>
            <h4>Release Date: {sneaker.release_date}</h4>
            <h4>Release Type: {sneaker.gender}</h4>
            <h4>Lowest Retail Price: {sneaker.lowest_price}</h4>
            <h4>Highest Retail Price {sneaker.highest_price}</h4>
          </div>
        ))}
    </div>
  );
};

export default LatestDrops;
