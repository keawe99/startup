const { MongoClient } = require("mongodb");

// Replace with your actual connection string
const url =
  "mongodb+srv://keawe1999:Dbroncs18!@sneakpeekcluster.hfiui.mongodb.net/?retryWrites=true&w=majority&appName=SneakPeekCluster";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("my_db"); // Use the 'my_db' database
    const usersCollection = db.collection("users"); // Use the 'users' collection

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
