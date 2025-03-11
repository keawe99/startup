const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

let users = []; // In-memory user storage (replace with a database in production)

app.use(express.static("public"));
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser());

// API Router
const apiRouter = express.Router();
app.use("/api", apiRouter);

// User Registration
apiRouter.post("/auth/create", async (req, res) => {
  if (users.find((u) => u.email === req.body.email)) {
    return res.status(409).send({ msg: "Existing user" });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = {
    email: req.body.email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  res.cookie(authCookieName, user.token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.send({ email: user.email });
});

// User Login
apiRouter.post("/auth/login", async (req, res) => {
  const user = users.find((u) => u.email === req.body.email);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    user.token = uuid.v4();
    res.cookie(authCookieName, user.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.send({ email: user.email });
  }
  res.status(401).send({ msg: "Unauthorized" });
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
