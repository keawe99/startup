const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const uploadHandler = require("./uploadHandler");
const { toFeedPost } = require("./feed");
const path = require("path");
const fs = require("fs");
const { WebSocketServer, WebSocket } = require("ws"); // WebSocket is needed for WebSocket.OPEN below

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

// Read dbConfig.json
const config = JSON.parse(fs.readFileSync("./dbConfig.json", "utf8"));

// MongoDB Connection
const url = config.MONGODB_URI;
const client = new MongoClient(url);
let usersCollection;
let postsCollection; // Add postsCollection here

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(config.MONGODB_DB_NAME); // Replace with your database name
    usersCollection = db.collection("users");
    postsCollection = db.collection("posts"); // Initialize postsCollection
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase(); // Connect when the server starts

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use(
  cors({
    origin: "http://localhost:5173", // Your client's origin
    credentials: true, // Allow cookies to be sent
  })
);

// API Router
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// User Registration
apiRouter.post("/auth/create", async (req, res) => {
  try {
    // Check if user with the same email already exists
    const existingEmailUser = await usersCollection.findOne({
      email: req.body.email,
    });
    if (existingEmailUser) {
      return res.status(409).json({ msg: "Existing email" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Create a new user object
    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: passwordHash,
      birthday: req.body.birthday,
      nike: req.body.nike,
      adidas: req.body.adidas,
      nb: req.body.nb,
      yeezy: req.body.yeezy,
      puma: req.body.puma,
      // Removed token from here
    };

    // Insert the new user into the database
    await usersCollection.insertOne(newUser);

    // Removed cookie setting from here

    res.status(201).json({ email: newUser.email }); // Send only email
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ msg: "Failed to create user" });
  }
});

// User Username
apiRouter.post("/auth/username", async (req, res) => {
  try {
    const { username, password, email } = req.body; // Receive password

    // Check if the username already exists
    const existingUsernameUser = await usersCollection.findOne({
      username: username,
    });
    if (existingUsernameUser) {
      return res.status(409).json({ msg: "Existing username" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the user's username and password in the database.
    // The SAME token must be stored in the database and sent in the cookie,
    // otherwise verifyAuth can never match this session.
    const token = uuid.v4();
    const updateResult = await usersCollection.updateOne(
      { email: email },
      { $set: { username: username, password: passwordHash, token } }
    );

    if (updateResult.modifiedCount === 1) {
      // Set the cookie here (no hard-coded domain, so it also works when deployed)
      res.cookie(authCookieName, token, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
      });
      res
        .status(200)
        .json({ msg: "Username and password updated successfully" });
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ msg: "Failed to update username" });
  }
});

// User Login
apiRouter.post("/auth/login", async (req, res) => {
  try {
    console.log("Login attempt for username:", req.body.username);
    const user = await usersCollection.findOne({ username: req.body.username });
    if (user) {
      console.log("User found:", user.username);
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordMatch) {
        console.log("Password match successful");
        user.token = uuid.v4();
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { token: user.token } }
        );
        res.cookie(authCookieName, user.token, {
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        });
        return res.send({ email: user.email, username: user.username });
      } else {
        console.log("Password match failed");
      }
    } else {
      console.log("User not found");
    }
    res.status(401).json({ msg: "Unauthorized" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// User Logout
apiRouter.delete("/auth/logout", async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    if (token) {
      await usersCollection.updateOne({ token }, { $unset: { token: 1 } });
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Authentication Middleware
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies[authCookieName];
    const user = token ? await usersCollection.findOne({ token }) : null;
    if (user) {
      req.user = user; // downstream routes can now tell who is making the request
      next();
    } else {
      res.status(401).send({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error verifying auth:", error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

// Who am I? The client uses this to know if it is really logged in.
apiRouter.get("/auth/me", verifyAuth, (req, res) => {
  res.send({
    username: req.user.username,
    email: req.user.email,
    profilePicUrl: req.user.profilePicUrl || null,
  });
});

//Protected Routes

apiRouter.get("/posts", verifyAuth, async (req, res) => {
  try {
    const viewerId = String(req.user._id);
    // Newest first. Capped at 100 until the feed gets pagination.
    const posts = await postsCollection
      .find()
      .sort({ _id: -1 })
      .limit(100)
      .toArray();

    // Look up each poster's CURRENT profile picture, so a changed picture
    // shows on their older posts too.
    const userIds = [...new Set(posts.map((p) => p.userId))]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    const users = userIds.length
      ? await usersCollection
          .find({ _id: { $in: userIds } }, { projection: { profilePicUrl: 1 } })
          .toArray()
      : [];
    const pictures = new Map(users.map((u) => [String(u._id), u.profilePicUrl]));

    res.json(posts.map((p) => toFeedPost(p, pictures.get(p.userId), viewerId)));
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// One user's profile: their public info plus all of their posts, newest first
apiRouter.get("/users/:username/posts", verifyAuth, async (req, res) => {
  try {
    const profileUser = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { username: 1, profilePicUrl: 1 } }
    );
    if (!profileUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const posts = await postsCollection
      .find({ userId: String(profileUser._id) })
      .sort({ _id: -1 })
      .limit(100)
      .toArray();

    const viewerId = String(req.user._id);
    res.json({
      username: profileUser.username,
      profilePicUrl: profileUser.profilePicUrl || null,
      posts: posts.map((p) =>
        toFeedPost(p, profileUser.profilePicUrl, viewerId)
      ),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: "Failed to fetch profile" });
  }
});

// Send a message to every connected browser (wss is created further down)
const broadcast = (message) => {
  const text = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
};

// Like or unlike a post (toggles for the logged-in user)
apiRouter.post("/posts/:id/like", verifyAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid post id" });
    }
    const postId = new ObjectId(req.params.id);
    const me = String(req.user._id);

    // Already liked? Remove the like. Otherwise add it. $addToSet can never
    // store the same user twice, even if two requests arrive at once.
    const removed = await postsCollection.updateOne(
      { _id: postId, likes: me },
      { $pull: { likes: me } }
    );
    let liked = false;
    if (removed.modifiedCount === 0) {
      const added = await postsCollection.updateOne(
        { _id: postId },
        { $addToSet: { likes: me } }
      );
      if (added.matchedCount === 0) {
        return res.status(404).json({ msg: "Post not found" });
      }
      liked = true;
    }

    const post = await postsCollection.findOne(
      { _id: postId },
      { projection: { likes: 1 } }
    );
    const likeCount = (post?.likes || []).length;

    broadcast({ type: "likeUpdate", postId: String(postId), likeCount });
    res.json({ liked, likeCount });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ msg: "Failed to update like" });
  }
});

// Use the upload handler
// app.use("/api/upload", uploadHandler(wss, postsCollection)); // Pass wss and postsCollection

// Landing Page Route (Example)
apiRouter.get("/landingPage", verifyAuth, (req, res) => {
  // Your landing page logic here
  res.send({ msg: "Landing page data" });
});

// Upload Photo Route (Example)
apiRouter.get("/uploadPhoto", verifyAuth, (req, res) => {
  // Your upload photo logic here
  res.send({ msg: "Upload photo data" });
});

// Latest Drops Route (Example)
apiRouter.get("/latestDrops", verifyAuth, (req, res) => {
  // Your latest drops logic here
  res.send({ msg: "Latest drops data" });
});

// Username Route (Example)
apiRouter.get("/username", verifyAuth, (req, res) => {
  // Your username logic here
  res.send({ msg: "Username data" });
});

// WebSocket Setup
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

// Use the upload handler
// Pass a getter, not the collection itself: postsCollection is still undefined
// here because the Mongo connection finishes after startup.
app.use(
  "/api/upload",
  verifyAuth,
  uploadHandler(
    wss,
    () => postsCollection,
    () => usersCollection
  )
);

// Pass wss to the uploadHandler module

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Browsers only listen. The server no longer re-broadcasts messages that
  // clients send, because anyone could use that to fake likes or posts.

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });
});

// Default Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ type: err.name, message: err.message });
});

apiRouter.get("/test", (req, res) => {
  res.send("Test route working!");
});

// Return the application's default
