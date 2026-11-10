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
// One document per follow: { followerId, followeeId, status, createdAt }
// status is "pending" (waiting for a private account to approve) or "accepted"
let followsCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(config.MONGODB_DB_NAME); // Replace with your database name
    usersCollection = db.collection("users");
    postsCollection = db.collection("posts"); // Initialize postsCollection
    followsCollection = db.collection("follows");
    // One follow per pair, and fast "who follows X" / "who does X follow" lookups
    await followsCollection.createIndex(
      { followerId: 1, followeeId: 1 },
      { unique: true }
    );
    await followsCollection.createIndex({ followeeId: 1, status: 1 });
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

// Can `viewerId` see `authorId`'s posts? Public accounts: yes. Private
// accounts: only the owner and followers whose request was accepted.
const canViewUserPosts = async (viewerId, authorId) => {
  if (viewerId === authorId) return true;
  if (!ObjectId.isValid(authorId)) return false;
  const author = await usersCollection.findOne(
    { _id: new ObjectId(authorId) },
    { projection: { isPrivate: 1 } }
  );
  if (!author) return false;
  if (!author.isPrivate) return true;
  const follow = await followsCollection.findOne({
    followerId: viewerId,
    followeeId: authorId,
    status: "accepted",
  });
  return Boolean(follow);
};

// The feed: your own posts plus posts from people you follow
apiRouter.get("/posts", verifyAuth, async (req, res) => {
  try {
    const viewerId = String(req.user._id);
    const followed = await followsCollection
      .find(
        { followerId: viewerId, status: "accepted" },
        { projection: { followeeId: 1 } }
      )
      .toArray();
    const authorIds = [viewerId, ...followed.map((f) => f.followeeId)];

    // Newest first. Capped at 100 until the feed gets pagination.
    const posts = await postsCollection
      .find({ userId: { $in: authorIds } })
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

// Find users by username: case-insensitive "contains" match, best matches
// (usernames that START with the search) first. Returns public info only.
apiRouter.get("/users/search", verifyAuth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 30);
    if (!q) return res.json([]);

    // Escape regex characters so "a.b" or "(" is searched literally
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await usersCollection
      .find(
        { username: { $regex: escaped, $options: "i" } },
        { projection: { username: 1, profilePicUrl: 1 } }
      )
      .limit(50)
      .toArray();

    const lower = q.toLowerCase();
    const startsWith = (u) => u.username.toLowerCase().startsWith(lower);
    users.sort(
      (a, b) =>
        Number(startsWith(b)) - Number(startsWith(a)) ||
        a.username.localeCompare(b.username)
    );

    res.json(
      users.slice(0, 20).map((u) => ({
        username: u.username,
        profilePicUrl: u.profilePicUrl || null,
      }))
    );
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ msg: "Search failed" });
  }
});

// One user's profile: their public info plus all of their posts, newest first
apiRouter.get("/users/:username/posts", verifyAuth, async (req, res) => {
  try {
    const profileUser = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { username: 1, profilePicUrl: 1, isPrivate: 1 } }
    );
    if (!profileUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const viewerId = String(req.user._id);
    const profileId = String(profileUser._id);

    // How the viewer relates to this profile: self, following, requested, none
    let relationship = "none";
    if (viewerId === profileId) {
      relationship = "self";
    } else {
      const follow = await followsCollection.findOne({
        followerId: viewerId,
        followeeId: profileId,
      });
      if (follow) {
        relationship = follow.status === "accepted" ? "following" : "requested";
      }
    }

    const isPrivate = Boolean(profileUser.isPrivate);
    const locked =
      isPrivate && relationship !== "self" && relationship !== "following";

    const [postCount, followerCount, followingCount] = await Promise.all([
      postsCollection.countDocuments({ userId: profileId }),
      followsCollection.countDocuments({
        followeeId: profileId,
        status: "accepted",
      }),
      followsCollection.countDocuments({
        followerId: profileId,
        status: "accepted",
      }),
    ]);

    // A locked profile never sends its posts to the browser at all
    const posts = locked
      ? []
      : await postsCollection
          .find({ userId: profileId })
          .sort({ _id: -1 })
          .limit(100)
          .toArray();

    res.json({
      username: profileUser.username,
      profilePicUrl: profileUser.profilePicUrl || null,
      isPrivate,
      relationship,
      locked,
      postCount,
      followerCount,
      followingCount,
      posts: posts.map((p) =>
        toFeedPost(p, profileUser.profilePicUrl, viewerId)
      ),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: "Failed to fetch profile" });
  }
});

// ---- Following ----

// Follow someone. A public account is followed right away; a private account
// gets a pending request that its owner must accept. Safe to call twice.
apiRouter.post("/users/:username/follow", verifyAuth, async (req, res) => {
  try {
    const target = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { isPrivate: 1 } }
    );
    if (!target) return res.status(404).json({ msg: "User not found" });

    const me = String(req.user._id);
    const targetId = String(target._id);
    if (me === targetId) {
      return res.status(400).json({ msg: "You can't follow yourself" });
    }

    const status = target.isPrivate ? "pending" : "accepted";
    try {
      // $setOnInsert: an existing follow keeps its status (a pending request
      // can't be turned into an accepted one by pressing Follow again)
      await followsCollection.updateOne(
        { followerId: me, followeeId: targetId },
        { $setOnInsert: { status, createdAt: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error; // two clicks at once: already saved
    }

    const follow = await followsCollection.findOne({
      followerId: me,
      followeeId: targetId,
    });
    res.json({
      relationship: follow.status === "accepted" ? "following" : "requested",
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ msg: "Failed to follow" });
  }
});

// Unfollow, or cancel a pending request
apiRouter.delete("/users/:username/follow", verifyAuth, async (req, res) => {
  try {
    const target = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { _id: 1 } }
    );
    if (!target) return res.status(404).json({ msg: "User not found" });

    await followsCollection.deleteOne({
      followerId: String(req.user._id),
      followeeId: String(target._id),
    });
    res.json({ relationship: "none" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ msg: "Failed to unfollow" });
  }
});

// People who follow the logged-in user, as public info, in the order of `rows`
const followersAsUsers = async (rows) => {
  const ids = rows
    .map((r) => r.followerId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));
  const users = ids.length
    ? await usersCollection
        .find({ _id: { $in: ids } }, { projection: { username: 1, profilePicUrl: 1 } })
        .toArray()
    : [];
  const byId = new Map(users.map((u) => [String(u._id), u]));
  return rows
    .map((r) => byId.get(r.followerId))
    .filter(Boolean)
    .map((u) => ({
      username: u.username,
      profilePicUrl: u.profilePicUrl || null,
    }));
};

// Pending requests waiting for the logged-in user to approve
apiRouter.get("/follow-requests", verifyAuth, async (req, res) => {
  try {
    const requests = await followsCollection
      .find({ followeeId: String(req.user._id), status: "pending" })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    res.json(await followersAsUsers(requests));
  } catch (error) {
    console.error("Error loading follow requests:", error);
    res.status(500).json({ msg: "Failed to load requests" });
  }
});

// The logged-in user's current followers (only they can see this list)
apiRouter.get("/followers", verifyAuth, async (req, res) => {
  try {
    const rows = await followsCollection
      .find({ followeeId: String(req.user._id), status: "accepted" })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    res.json(await followersAsUsers(rows));
  } catch (error) {
    console.error("Error loading followers:", error);
    res.status(500).json({ msg: "Failed to load followers" });
  }
});

// Remove one of your followers. They stop seeing your posts, and on a private
// account they have to send a new request to get back in.
apiRouter.delete("/followers/:username", verifyAuth, async (req, res) => {
  try {
    const follower = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { _id: 1 } }
    );
    if (!follower) return res.status(404).json({ msg: "User not found" });

    const result = await followsCollection.deleteOne({
      followerId: String(follower._id),
      followeeId: String(req.user._id),
      status: "accepted",
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "That user doesn't follow you" });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Error removing follower:", error);
    res.status(500).json({ msg: "Failed to remove follower" });
  }
});

// Accept (approve) or decline a pending request sent TO the logged-in user
const answerFollowRequest = (accept) => async (req, res) => {
  try {
    const requester = await usersCollection.findOne(
      { username: req.params.username },
      { projection: { _id: 1 } }
    );
    if (!requester) return res.status(404).json({ msg: "User not found" });

    const filter = {
      followerId: String(requester._id),
      followeeId: String(req.user._id),
      status: "pending",
    };
    const result = accept
      ? await followsCollection.updateOne(filter, { $set: { status: "accepted" } })
      : await followsCollection.deleteOne(filter);

    const changed = accept ? result.matchedCount : result.deletedCount;
    if (changed === 0) return res.status(404).json({ msg: "No pending request" });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error answering follow request:", error);
    res.status(500).json({ msg: "Failed to update request" });
  }
};
apiRouter.post("/follow-requests/:username/accept", verifyAuth, answerFollowRequest(true));
apiRouter.post("/follow-requests/:username/decline", verifyAuth, answerFollowRequest(false));

// Turn the logged-in user's account private or public. Going public approves
// everyone who was waiting, since there is nothing left to approve.
apiRouter.put("/users/me/privacy", verifyAuth, async (req, res) => {
  try {
    if (typeof req.body.isPrivate !== "boolean") {
      return res.status(400).json({ msg: "isPrivate must be true or false" });
    }
    const isPrivate = req.body.isPrivate;
    await usersCollection.updateOne({ _id: req.user._id }, { $set: { isPrivate } });
    if (!isPrivate) {
      await followsCollection.updateMany(
        { followeeId: String(req.user._id), status: "pending" },
        { $set: { status: "accepted" } }
      );
    }
    res.json({ isPrivate });
  } catch (error) {
    console.error("Error updating privacy:", error);
    res.status(500).json({ msg: "Failed to update privacy" });
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

    // Knowing a post's id must not let you like a private account's post
    const target = await postsCollection.findOne(
      { _id: postId },
      { projection: { userId: 1 } }
    );
    if (!target || !(await canViewUserPosts(me, target.userId))) {
      return res.status(404).json({ msg: "Post not found" });
    }

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
    () => usersCollection,
    () => followsCollection
  )
);

// Pass wss to the uploadHandler module

wss.on("connection", async (ws, req) => {
  console.log("Client connected via WebSocket");

  // Work out who this connection belongs to from the login cookie the browser
  // sent with the upgrade request. New-post messages are only delivered to
  // the author and their accepted followers, so an unknown connection gets none.
  ws.userId = null;
  try {
    const match = new RegExp(`(?:^|;\\s*)${authCookieName}=([^;]+)`).exec(
      req.headers.cookie || ""
    );
    if (match) {
      const user = await usersCollection.findOne(
        { token: decodeURIComponent(match[1]) },
        { projection: { _id: 1 } }
      );
      if (user) ws.userId = String(user._id);
    }
  } catch (error) {
    console.error("Error identifying WebSocket client:", error);
  }

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
