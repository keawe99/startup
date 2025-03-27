const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 4001;

app.use(cors());

// Read config from dbConfig.json
let config;
try {
  config = JSON.parse(fs.readFileSync("./dbConfig.json", "utf8"));
} catch (err) {
  console.error("Error reading dbConfig.json:", err);
  process.exit(1); // Exit if config cannot be loaded
}

app.get("/api/sneakers", async (req, res) => {
  const searchTerm = req.query.searchTerm; // Get search term from query

  console.log("Received searchTerm:", searchTerm);

  if (!searchTerm) {
    return res.status(400).json({ error: "searchTerm parameter is required" });
  }

  const options = {
    method: "GET",
    url: "https://kickscrew-sneakers-data.p.rapidapi.com/search",
    params: {
      query: searchTerm,
    },
    headers: {
      "X-RapidAPI-Key": config.SNEAKERS_API_KEY,
      "X-RapidAPI-Host": "kickscrew-sneakers-data.p.rapidapi.com",
    },
  };

  console.log("Axios options:", options);

  try {
    const response = await axios.request(options);

    console.log("Kickscrew API Response:", response.data); // Log the response

    const results = response.data.products; // Corrected access here

    if (!results || !Array.isArray(results)) {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    res.status(200).json(results); // Changed to 200 status code
  } catch (error) {
    console.error("RapidAPI Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("Request:", error.request);
    }
    res
      .status(500)
      .json({ error: "Request setup error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Sneaker API listening at http://localhost:${port}`);
});
