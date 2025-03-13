import React, { useState, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "../styles.css";

const LatestDrops = () => {
  const [sneakers, setSneakers] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const apiKey = "151c6c9374msh46e4fd4d3364378p1b659ajsn4315dde33bde"; // Your API key

  useEffect(() => {
    const fetchSneakers = async () => {
      try {
        setLoading(true);
        setError(null);

        const options = {
          method: "GET",
          url: "https://kickscrew-sneakers-data.p.rapidapi.com/search",
          params: {
            query:
              searchTerm || "yeezy, nike, new balance, puma, hoka, on, ugg",
            hitsPerPage: "20",
            page: "1",
          },
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "kickscrew-sneakers-data.p.rapidapi.com",
          },
        };

        const response = await axios.request(options);

        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.products)) {
          // Check if response.data exists and products is an array
          setSneakers(response.data.products); // Correctly extract the products array
        } else {
          console.error("Invalid API response:", response.data);
          setError("Invalid API response format");
        }

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchSneakers, 300);
    debouncedFetch();

    return () => debouncedFetch.cancel();
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

      {loading && <div className="loading">Loading...</div>}

      {error && <div className="error">Error: {error.message}</div>}

      <div className="sneaker-grid">
        {Array.isArray(sneakers) &&
          sneakers.map((sneaker) => (
            <div key={sneaker.id} className="sneaker-card">
              {sneaker.image && (
                <img
                  src={sneaker.image}
                  alt={sneaker.name}
                  className="sneaker-image"
                />
              )}
              <h3 className="sneaker-name">{sneaker.name}</h3>
              <p className="sneaker-release-date">
                Release Date: {sneaker.releaseDate || "Not Available"}
              </p>
              {/* Add other details as needed */}
            </div>
          ))}
      </div>
    </div>
  );
};

export default LatestDrops;
