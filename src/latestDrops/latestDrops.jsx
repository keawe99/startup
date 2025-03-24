import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";

const LatestDrops = () => {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSneakers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:4001/api/sneakers?searchTerm=${searchTerm}`
        );
        console.log("Backend API Response:", response.data);
        setSneakers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchSneakers();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="latest-drops-container">
      <h2>Latest Sneaker Drops</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for brands or keywords..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <br />
      <br />
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error.message}</div>}
      <div className="sneaker-grid">
        {sneakers.map((sneaker) => (
          <div key={sneaker.styleID} className="sneaker-card">
            {sneaker.image && (
              <img
                src={sneaker.image}
                alt={sneaker.shoeName}
                className="sneaker-image"
              />
            )}
            <br />
            <h3 className="sneaker-name">{sneaker.shoeName}</h3>
            <p>Colorway: {sneaker.colorway}</p>
            <p>Release Date: {sneaker.releaseDate}</p>
            <p>Retail Price: {sneaker.retailPrice}</p>
            <p>Style ID: {sneaker.styleID}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestDrops;
