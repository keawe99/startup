const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const { MongoClient } = require("mongodb");

const router = express.Router(); // Create an Express router

// Configure Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Configure AWS S3
const s3 = new AWS.S3({
  // Will need to create S3 Bucket!
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure MongoDB
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
let postsCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME);
    postsCollection = db.collection("posts");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase();

// Define the /api/upload route
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const s3UploadResult = await s3.upload(params).promise();

    const postData = {
      imageUrl: s3UploadResult.Location,
      description: req.body.description,
      userId: req.body.userId, // Assuming you have user authentication
      // Add other post data
    };

    await postsCollection.insertOne(postData);

    res.json({ imageUrl: s3UploadResult.Location });
  } catch (error) {
    console.error("Error uploading to S3 or storing post:", error);
    res.status(500).json({ error: "Failed to upload image or store post" });
  }
});

module.exports = router; // Export the router
