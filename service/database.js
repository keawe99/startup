const { MongoClient } = require("mongodb");
const fs = require("fs");

// Read config from dbConfig.json
let config;
try {
  config = JSON.parse(fs.readFileSync("./dbConfig.json", "utf8"));
} catch (err) {
  console.error("Error reading dbConfig.json:", err);
  process.exit(1); // Exit if config cannot be loaded
}

// Access MongoDB URI from config
const url = config.MONGODB_URI;

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(config.MONGODB_DB_NAME); // Use database name from config
    const usersCollection = db.collection("users"); // Use 'users' collection

    // Insert a new user document with all your desired fields
    const insertResult = await usersCollection.insertOne({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      username: "janedoe",
      password: "hashed_password", // In real app, hash password
      birthday: "1990-01-01",
      nike: true,
      adidas: false,
      nb: true,
      yeezy: false,
      puma: true,
      token: "some_uuid", // Generate a UUID here
    });

    console.log("Inserted user:", insertResult.insertedId);

    // Optional: Retrieve the inserted document or all documents
    const findResult = await usersCollection.find({}).toArray();
    console.log("Found users:", findResult);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await client.close();
  }
}

main();
