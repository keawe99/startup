const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { MongoClient } = require("mongodb");
const fs = require("fs");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Read config.json
const config = JSON.parse(fs.readFileSync("./dbConfig.json", "utf8"));

// Configure AWS S3
const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

const url = config.MONGODB_URI;
const client = new MongoClient(url);
let postsCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db(config.MONGODB_DB_NAME);
    postsCollection = db.collection("posts");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const params = {
      Bucket: config.S3_BUCKET_NAME,
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    const s3UploadResult = await s3Client.send(command);

    const postData = {
      imageUrl: `https://${config.S3_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${params.Key}`,
      description: req.body.description,
      userId: req.body.userId,
    };

    await postsCollection.insertOne(postData);

    res.json({ imageUrl: postData.imageUrl });
  } catch (error) {
    console.error("Error uploading to S3 or storing post:", error);
    res.status(500).json({ error: "Failed to upload image or store post" });
  }
});

module.exports = router;

// commit change
