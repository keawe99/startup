import React, { useState, useEffect } from "react";

import axios from "axios";

import debounce from "lodash.debounce";

import "../styles.css";

const LatestDrops = () => {
  const [sneakers, setSneakers] = useState(); // Initialize as an empty array

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [releaseYearFilter, setReleaseYearFilter] = useState("");

  const apiKey = "151c6c9374msh46e4fd4d3364378p1b659ajsn4315dde33bde";

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

            releaseYear: releaseYearFilter,
          },

          headers: {
            "X-RapidAPI-Key": apiKey,

            "X-RapidAPI-Host": "kickscrew-sneakers-data.p.rapidapi.com",
          },
        };

        const response = await axios.request(options);

        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.products)) {
          setSneakers(response.data.products);
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
  }, [searchTerm, releaseYearFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleReleaseYearChange = (event) => {
    setReleaseYearFilter(event.target.value);
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

        <input
          type="number"
          placeholder="Filter by Release Year"
          value={releaseYearFilter}
          onChange={handleReleaseYearChange}
        />
      </div>

      <br></br>

      <br></br>

      {loading && <div className="loading">Loading...</div>}

      {error && <div className="error">Error: {error.message}</div>}

      <div className="sneaker-grid">
        {Array.isArray(sneakers) &&
          sneakers.map((sneaker) => {
            console.log(sneaker); // <------------------ HERE'S THE CONSOLE LOG

            return (
              <div key={sneaker.id} className="sneaker-card">
                {sneaker.image && (
                  <img
                    src={sneaker.image}
                    alt={sneaker.name}
                    className="sneaker-image"
                  />
                )}
                <br></br>

                <h3 className="sneaker-name">Name: {sneaker.title}</h3>

                <h3 className="sneaker-name">Product ID: {sneaker.model_no}</h3>

                {releaseYearFilter && (
                  <p className="release-year-filter">
                    Release Year Filter: {releaseYearFilter}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LatestDrops;
