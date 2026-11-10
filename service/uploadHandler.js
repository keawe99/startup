const express = require("express");
const multer = require("multer");
const uuid = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const { WebSocket } = require("ws");
const { toFeedPost } = require("./feed");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Work out what a file really is from its first bytes, instead of trusting the
// file name or Content-Type the browser sent. SVG is deliberately not allowed:
// it can contain scripts, and the bucket is publicly readable.
const detectImageType = (buf) => {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    buf.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return { mime: "image/png", ext: "png" };
  }
  const head = buf.subarray(0, 6).toString("ascii");
  if (head === "GIF87a" || head === "GIF89a") {
    return { mime: "image/gif", ext: "gif" };
  }
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
};

const uploadHandler = (
  wss,
  getPostsCollection,
  getUsersCollection,
  getFollowsCollection
) => {
  // The get...Collection arguments are functions so we read the collections at
  // request time, after the MongoDB connection has finished.
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  });

  const config = JSON.parse(fs.readFileSync("./dbConfig.json", "utf8"));

  const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
  });

  const publicUrl = (key) =>
    `https://${config.S3_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;

  const broadcast = (message) => {
    if (!wss) return;
    const text = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(text);
    });
  };

  // Deliver a message only to the author and the people who follow them
  // (each socket's userId is set from its login cookie in index.js)
  const sendToAuthorAndFollowers = async (authorId, message) => {
    if (!wss) return;
    const follows = await getFollowsCollection()
      .find(
        { followeeId: authorId, status: "accepted" },
        { projection: { followerId: 1 } }
      )
      .toArray();
    const allowed = new Set([authorId, ...follows.map((f) => f.followerId)]);
    const text = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && allowed.has(client.userId)) {
        client.send(text);
      }
    });
  };

  // Runs multer, and turns its errors into clean JSON responses
  const receiveImage = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "Image must be 5 MB or smaller" });
      }
      console.error("Upload parse error:", err);
      return res.status(400).json({ error: "Could not read the uploaded file" });
    });
  };

  // Returns the detected image type, or sends an error response and returns null
  const requireImage = (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No image file uploaded" });
      return null;
    }
    const type = detectImageType(req.file.buffer);
    if (!type) {
      res
        .status(415)
        .json({ error: "Only JPEG, PNG, GIF or WebP images are allowed" });
      return null;
    }
    return type;
  };

  // POST /api/upload  (a new post)
  router.post("/", receiveImage, async (req, res) => {
    try {
      const postsCollection = getPostsCollection();
      if (!postsCollection) {
        return res.status(503).json({ error: "Database not ready, try again" });
      }
      const type = requireImage(req, res);
      if (!type) return;

      // Our own file name, so odd characters in the original name can't break the URL
      const key = `posts/${Date.now()}-${uuid.v4()}.${type.ext}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.S3_BUCKET_NAME,
          Key: key,
          Body: req.file.buffer,
          ContentType: type.mime,
        })
      );

      const postData = {
        imageUrl: publicUrl(key),
        description: String(req.body.description || "").slice(0, 500),
        // Identity comes from the verified login (req.user), never from the browser
        userId: String(req.user._id),
        username: req.user.username,
        createdAt: new Date(),
        likes: [],
      };

      await postsCollection.insertOne(postData); // adds postData._id

      // The post is saved; a live-update failure must not fail the upload
      try {
        await sendToAuthorAndFollowers(postData.userId, {
          type: "newPost",
          post: toFeedPost(postData, req.user.profilePicUrl, null),
        });
      } catch (error) {
        console.error("Error sending live update:", error);
      }

      res.json({ imageUrl: postData.imageUrl });
    } catch (error) {
      console.error("Error uploading to S3 or storing post:", error);
      res.status(500).json({ error: "Failed to upload image or store post" });
    }
  });

  // POST /api/upload/profile-picture
  router.post("/profile-picture", receiveImage, async (req, res) => {
    try {
      const usersCollection = getUsersCollection();
      if (!usersCollection) {
        return res.status(503).json({ error: "Database not ready, try again" });
      }
      const type = requireImage(req, res);
      if (!type) return;

      // One fixed key per user: a new picture overwrites the old one, so nothing
      // is left behind in S3 (and the upload-only IAM user needs no delete rights).
      const key = `profiles/${String(req.user._id)}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.S3_BUCKET_NAME,
          Key: key,
          Body: req.file.buffer,
          ContentType: type.mime,
        })
      );

      // ?v= makes browsers fetch the new picture instead of showing a cached one
      const profilePicUrl = `${publicUrl(key)}?v=${Date.now()}`;
      await usersCollection.updateOne(
        { _id: req.user._id },
        { $set: { profilePicUrl } }
      );

      broadcast({
        type: "profileUpdate",
        userId: String(req.user._id),
        profilePicUrl,
      });

      res.json({ profilePicUrl });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  });

  return router;
};

uploadHandler.detectImageType = detectImageType; // exposed so it can be tested
module.exports = uploadHandler;
