const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });

const app = express();
const port = 4001;

app.use(cors());

app.get("/api/sneakers", async (req, res) => {
  const searchTerm = req.query.searchTerm; // Get search term from query

  if (!searchTerm) {
    return res.status(400).json({ error: "searchTerm parameter is required" });
  }

  const options = {
    method: "GET",
    url: "https://sneaker-database-stockx.p.rapidapi.com/stockx/sneakers", // Use "Stockx Sneakers Only" endpoint
    params: {
      query: searchTerm, // Pass the search term
    },
    headers: {
      "X-RapidAPI-Key": process.env.SNEAKERS_API_KEY,
      "X-RapidAPI-Host": "sneaker-database-stockx.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const results = response.data.results; // Access the 'results' array

    if (!results || !Array.isArray(results)) {
      // Handle cases where response.data.results is null or not an array
      return res.status(500).json({ error: "Invalid API response format" });
    }

    res.json(results); // Send the 'results' array to the frontend
  } catch (error) {
    console.error("RapidAPI Error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: "API request failed",
        details: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ error: "No response from API" });
    } else {
      // Something happened in setting up the request that triggered an Error
      res
        .status(500)
        .json({ error: "Request setup error", details: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Sneaker API listening at http://localhost:${port}`);
});
