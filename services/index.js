const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs"); // For password hashing
const uuid = require("uuid"); // For generating unique IDs

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

// In-memory user storage (replace with a database in production)
let users = [];

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser());

// API Router
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// User Registration
apiRouter.post("/auth/create", async (req, res) => {
  try {
    // Check if user with the same email already exists
    if (users.find((u) => u.email === req.body.email)) {
      return res.status(409).json({ msg: "Existing email" });
    }

    // Check if user with the same username already exists
    if (users.find((u) => u.username === req.body.username)) {
      return res.status(409).json({ msg: "Existing username" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Create a new user object
    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username, // Store username
      password: passwordHash,
      birthday: req.body.birthday,
      nike: req.body.nike,
      adidas: req.body.adidas,
      nb: req.body.nb,
      yeezy: req.body.yeezy,
      puma: req.body.puma,
      token: uuid.v4(),
    };

    users.push(newUser);

    res.cookie(authCookieName, newUser.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(201).json({ email: newUser.email });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ msg: "Failed to create user" });
  }
});

// User Login
apiRouter.post("/auth/login", async (req, res) => {
  try {
    console.log("Login attempt for username:", req.body.username); // Log username
    const user = users.find((u) => u.username === req.body.username); // Find by username
    if (user) {
      console.log("User found:", user.username);
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordMatch) {
        console.log("Password match successful");
        user.token = uuid.v4();
        res.cookie(authCookieName, user.token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        return res.send({ email: user.email }); // You might want to send back the username here as well
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
apiRouter.delete("/auth/logout", (req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Authentication Middleware
const verifyAuth = (req, res, next) => {
  if (users.find((u) => u.token === req.cookies[authCookieName])) {
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
};

// Protected Route Example
apiRouter.get("/protected", verifyAuth, (req, res) => {
  res.send({ msg: "Protected resource accessed." });
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
