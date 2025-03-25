const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs"); // For password hashing
const uuid = require("uuid"); // For generating unique IDs
const { MongoClient } = require("mongodb");

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

// MongoDB Connection
const url =
  "mongodb+srv://keawe1999:Dbroncs18!@sneakpeekcluster.hfiui.mongodb.net/?retryWrites=true&w=majority&appName=SneakPeekCluster"; // Replace with your connection string
const client = new MongoClient(url);
let usersCollection; // Declare outside the connection to make it accessible

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("my_db"); // Replace with your database name
    usersCollection = db.collection("users");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase(); // Connect when the server starts

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

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
      token: uuid.v4(),
    };

    // Insert the new user into the database
    await usersCollection.insertOne(newUser);

    res.cookie(authCookieName, newUser.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: "sneakpeek360.com",
    });

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

    // Update the user's username and password in the database
    const updateResult = await usersCollection.updateOne(
      { email: email },
      { $set: { username: username, password: passwordHash } } // Update password
    );

    if (updateResult.modifiedCount === 1) {
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
          sameSite: "strict",
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

// User Username

apiRouter.post("/auth/username", async (req, res) => {
  try {
    const { username, email } = req.body;

    // Update the user's username in the database
    const updateResult = await usersCollection.updateOne(
      { email: email },
      { $set: { username: username } }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ msg: "Username updated successfully" });
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ msg: "Failed to update username" });
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
    if (token && (await usersCollection.findOne({ token }))) {
      next();
    } else {
      res.status(401).send({ msg: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error verifying auth:", error);
    res.status(500).send({ msg: "Internal server error" });
  }
};
//Protected Routes

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

// Default Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ type: err.name, message: err.message });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

apiRouter.get("/test", (req, res) => {
  res.send("Test route working!");
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});
