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

// ---- In-memory cache (cleared whenever this server restarts) ----
// Saves RapidAPI quota: a repeat search is served from memory instead.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_ENTRIES = 100;
const cache = new Map(); // key -> { results, expiresAt }

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.results;
};

const setCached = (key, results) => {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value); // drop the oldest entry
  }
  cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
};

app.get("/api/sneakers", async (req, res) => {
  const searchTerm = req.query.searchTerm; // Get search term from query

  console.log("Received searchTerm:", searchTerm);

  if (!searchTerm) {
    return res.status(400).json({ error: "searchTerm parameter is required" });
  }

  const cacheKey = searchTerm.trim().toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`Cache HIT for "${cacheKey}" (no RapidAPI request used)`);
    res.set("X-Cache", "HIT");
    return res.status(200).json(cached);
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

  try {
    const response = await axios.request(options);

    const results = response.data.products; // Corrected access here

    if (!results || !Array.isArray(results)) {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    // Only successful responses are cached, never errors
    setCached(cacheKey, results);
    console.log(
      `Cache MISS for "${cacheKey}": used 1 RapidAPI request, cached ${results.length} results`
    );

    res.set("X-Cache", "MISS");
    res.status(200).json(results);
  } catch (error) {
    console.error("RapidAPI Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("Request:", error.request);
    }
    const status = error.response?.status === 429 ? 429 : 500;
    res.status(status).json({
      error:
        status === 429
          ? "RapidAPI quota or rate limit reached"
          : "Request setup error",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Sneaker API listening at http://localhost:${port}`);
});
