# CS 260 Notes

[My startup](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS Notes

I have bought a DNS name called sneakpeek360.com using Amazon's Route 53 element. I also have an EC2 instance that I am currently renting to deploy the web app on a server in North Virginia. I linked the public ip address to my domain name and was able to get it certified.

## HTML Notes

For this deliverable, I created a web app using the figma layout that I had made prior to this part of the deliverable. I created six simple webpages for a user to navigate through as they login and create their own sneakpeek360 account. I added a little bit of CSS to make it look more appealing. Still looks a little static but I have a good view of where I want to head from here. I will add more html elements as I progress throughout this project, but for now we will stick with this.

## CSS Notes

For this deliverable, I added an embedded youtube video on the homepage screen to make the web page stand out more. I also added an all black background with white text, making it easy for the user to read. I also reformatted my forms to make them look more user friendly and appealling to the eye. I also added a verification page where the user can input digits individually when they receive a confirmation email. Lastly, I split the landing page into 3 columns so the user can see everything they need to see at all times.

## React Notes

For this deliverable, I had to download react and inject it into my current project. The initial set-up wasn't too challenging, especially since the directions walk us through it pretty easily. However, it took a while for the layout that I want to be created. It was a little challenging splitting up certain parts of my view pages into columns, so I created another separate view called latestDrops. From there, users can easily navigate to a page where the latest drops of sneakers will update.

## React 2 Notes

For this deliverable, I really wanted to focus on displaying the user's username on my landing page when they log in or create a username. I was able to do so implementing the useState and useEffect methods from React. I had to assign the username variable into the parent file (app.jsx), then create a function inside of username.jsx and pass the returned value into landingPage.jsx. I also did the same thing for loginPage.jsx. Next steps will be to verify if the user has an account and send them a verification email when I get there, but I will need to have my database handle that information.

## Services Notes

THIRD PARTY ENDPOINT IS WRITTEN IN src/latestDrops/latestDrops.jsx

For this deliverable, I am working on authenticating my users that login or create an account in sneakpeek360.
I have figured out the internal server errors. It is because I was not running my index.js file while running my startup project in dev. I have opened a separate terminal and for everytime I want to dev my project, I run the index.js file as well to ensure my data is being passed correctly as I test my project. A user can now sign up for an account in my project and log out if they want to. Right now, I am having trouble figuring out how to get a returning user to log in. Here is the error that I am getting thrown back from the browser's console:

loginService.js:26 Login service error: SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
at loginUser (loginService.js:21:40)
at async handleSubmit (loginPage.jsx:14:20)

For Later: add a button where once a user logs in they can add photos on the web app. Also add css to the logout button. If time permits, create an account webpage where a user can view and edit their profile information.

ADDED https://kickscrew-sneakers-data.p.rapidapi.com/search?query=yeezy%2C%20nike%2C%20new%20balance%2C%20puma%2C%20hoka%2C%20on%2C%20ugg AS BASE API URL

also, for my backend to remember logged out user information, i will need to attach a database for that functionality. looks like we will cover that topic later.

Here is a step-by-step of what do to with mongoDB:
You've correctly identified the primary issue: your users array is in-memory and therefore does not persist data between server restarts. Every time your Node.js server restarts, the users array is re-initialized as an empty array, effectively erasing all user data.

To address this, you need to use a persistent data storage solution, such as a database.

Here's a breakdown of the steps to transition from in-memory storage to a database using MongoDB as an example:

1. Set up MongoDB:

Install MongoDB: If you haven't already, install MongoDB on your system or use a cloud-based MongoDB service (e.g., MongoDB Atlas).
Start MongoDB: Ensure that your MongoDB server is running. 2. Install Mongoose (for MongoDB interaction):

Install Mongoose: In your project directory, run:

Bash

npm install mongoose 3. Create a User Model:

Create a models directory (if you don't have one) and create a user.js file inside it.

Define a Mongoose schema for your users:

JavaScript

// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
firstName: { type: String, required: true },
lastName: { type: String, required: true },
email: { type: String, required: true, unique: true },
username: { type: String, required: true, unique: true },
password: { type: String, required: true },
birthday: { type: Date },
nike: { type: Boolean },
adidas: { type: Boolean },
nb: { type: Boolean },
yeezy: { type: Boolean },
puma: { type: Boolean },
});

module.exports = mongoose.model("User", userSchema); 4. Connect to MongoDB and Update index.js:

Import Mongoose and the User model in index.js:

JavaScript

const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const mongoose = require("mongoose");
const User = require("./models/user"); // Import the User model
Connect to MongoDB:

JavaScript

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

// Connect to MongoDB
mongoose.connect("YOUR_MONGODB_CONNECTION_STRING", {
useNewUrlParser: true,
useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
console.log("Connected to MongoDB");
});
Replace YOUR_MONGODB_CONNECTION_STRING with your actual MongoDB connection string.
Update Registration and Login Routes:

JavaScript

// User Registration
apiRouter.post("/auth/create", async (req, res) => {
try {
if (await User.findOne({ email: req.body.email })) {
return res.status(409).json({ msg: "Existing email" });
}
if (await User.findOne({ username: req.body.username })) {
return res.status(409).json({ msg: "Existing username" });
}
const passwordHash = await bcrypt.hash(req.body.password, 10);
const newUser = new User({
...req.body,
password: passwordHash,
});
await newUser.save();
const token = uuid.v4();
res.cookie(authCookieName, token, {
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
const user = await User.findOne({ username: req.body.username });
if (user) {
const passwordMatch = await bcrypt.compare(
req.body.password,
user.password
);
if (passwordMatch) {
const token = uuid.v4();
res.cookie(authCookieName, token, {
httpOnly: true,
secure: true,
sameSite: "strict",
});
return res.send({ email: user.email });
}
}
res.status(401).json({ msg: "Unauthorized" });
} catch (error) {
console.error("Error during login:", error);
res.status(500).json({ msg: "Internal server error" });
}
});
Update Authentication Middleware:

JavaScript

// Authentication Middleware
const verifyAuth = async (req, res, next) => {
try {
const user = await User.findOne({ token: req.cookies[authCookieName] });
if (user) {
next();
} else {
res.status(401).send({ msg: "Unauthorized" });
}
} catch (error) {
console.error("Authentication error:", error);
res.status(500).send({ msg: "Internal server error" });
}
}; 5. Test Thoroughly:

Register a new user.
Log in with the new user.
Log out.
Restart your server.
Log in again with the same user.
Key Changes:

Database Integration: User data is now stored in MongoDB, ensuring persistence.
Mongoose Models: Mongoose models are used to interact with the database.
Asynchronous Operations: The code uses async/await for asynchronous database operations.
Error Handling: Robust error handling is included in the database interactions.
By making these changes, you will ensure that your user data persists across server restarts, and your users will be able to log back in after logging out.
