const express = require("express");
const SneaksAPI = require("sneaks-api");
const cors = require("cors");

const app = express();
const port = 4001;

app.use(cors());

const sneaks = new SneaksAPI();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSneakersWithRetry(
  searchTerm,
  limit,
  retryCount = 3,
  delayMs = 1000
) {
  try {
    await delay(delayMs); // Initial delay
    return new Promise((resolve, reject) => {
      sneaks.getProducts(searchTerm, limit, (err, products) => {
        if (err) {
          reject(err);
        } else {
          resolve(products);
        }
      });
    });
  } catch (error) {
    if (
      retryCount > 0 &&
      error.code === "ERR_NON_2XX_3XX_RESPONSE" &&
      error.message.includes("530")
    ) {
      console.log(`Retry ${4 - retryCount} for 530 error...`);
      return getSneakersWithRetry(
        searchTerm,
        limit,
        retryCount - 1,
        delayMs * 2
      ); // Exponential backoff
    } else {
      throw error;
    }
  }
}

async function getProductPricesWithRetry(
  styleID,
  retryCount = 3,
  delayMs = 1000
) {
  try {
    await delay(delayMs);
    return new Promise((resolve, reject) => {
      sneaks.getProductPrices(styleID, (err, product) => {
        if (err) {
          reject(err);
        } else {
          resolve(product);
        }
      });
    });
  } catch (error) {
    if (
      retryCount > 0 &&
      error.code === "ERR_NON_2XX_3XX_RESPONSE" &&
      error.message.includes("530")
    ) {
      console.log(`Retry ${4 - retryCount} for 530 error...`);
      return getProductPricesWithRetry(styleID, retryCount - 1, delayMs * 2);
    } else {
      throw error;
    }
  }
}

app.get("/api/sneakers", async (req, res) => {
  const searchTerm =
    req.query.searchTerm || "yeezy, nike, new balance, puma, hoka, on, ugg";

  try {
    const products = await getSneakersWithRetry(searchTerm, 20);
    console.log("Sneaks API Raw Data:", products);

    // Fetch image URLs for each sneaker
    const sneakersWithImages = await Promise.all(
      products.map(async (sneaker) => {
        try {
          const productDetails = await getProductPricesWithRetry(
            sneaker.styleID
          );
          return {
            ...sneaker,
            image: productDetails.image, // Add the image URL
          };
        } catch (error) {
          console.error(`Error fetching image for ${sneaker.shoeName}:`, error);
          return {
            ...sneaker,
            image: null, // Set image to null if there's an error
          };
        }
      })
    );

    res.json(sneakersWithImages);
  } catch (error) {
    console.error("Sneaks API Error:", error);
    res.status(500).json({ error: "Failed to fetch sneakers" });
  }
});

app.listen(port, () => {
  console.log(`Sneaker API listening at http://localhost:${port}`);
});
