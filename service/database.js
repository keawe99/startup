const { MongoClient } = require("mongodb");

// Replace with your actual connection string
const url =
  "mongodb+srv://keawe1999:<YOUR_PASSWORD>@sneakpeekcluster.hflul.mongodb.net/?apiVersion=1&username=keawe1999";

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("sample_mflix"); // Replace with your database name
    const collection = db.collection("comments"); // Replace with your collection name

    // Now you can perform database operations here
    // Example: inserting a document
    const insertResult = await collection.insertOne({
      item: "example",
      qty: 10,
    });
    console.log("Inserted document:", insertResult.insertedId);

    // Example: querying documents
    const findResult = await collection.find({}).toArray();
    console.log("Found documents:", findResult);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await client.close();
  }
}

main();
