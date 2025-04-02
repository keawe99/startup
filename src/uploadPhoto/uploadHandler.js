const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { MongoClient } = require("mongodb");

const uploadHandler = (wss) => {
  // Accept wss as a parameter
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  // Configure AWS S3 v3
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

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

  router.post("/", upload.single("image"), async (req, res) => {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      const postData = {
        imageUrl: imageUrl,
        description: req.body.description,
        userId: req.body.userId,
      };

      await postsCollection.insertOne(postData);

      // Send WebSocket message to all clients
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "newPost", post: postData }));
          }
        });
      }

      res.json({ imageUrl: postData.imageUrl });
    } catch (error) {
      console.error("Error uploading to S3 or storing post:", error);
      res.status(500).json({ error: "Failed to upload image or store post" });
    }
  });

  return router; // Return the router
};

module.exports = uploadHandler; // Export the function, not the router
