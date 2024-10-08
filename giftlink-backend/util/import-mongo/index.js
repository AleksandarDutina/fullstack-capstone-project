require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

// MongoDB connection URL
const url = process.env.MONGO_URL; // Ensure this is set to your local MongoDB URI
const filename = `${__dirname}/${process.env.DATASRC}`; // Read from the .env for the filename
const dbName = "giftdb"; // Name of the database
const collectionName = "gifts"; // Name of the collection

// Load the array of gifts into the data object
let data;
try {
  data = JSON.parse(fs.readFileSync(filename, "utf8")).docs; // Assuming docs is the top-level property in your JSON
} catch (error) {
  console.error("Error reading the JSON file:", error);
  process.exit(1); // Exit the script if there's an error reading the file
}

// Connect to database and insert data into the collection
async function loadData() {
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log("Connected successfully to server");

    // Database will be created if it does not exist
    const db = client.db(dbName);

    // Collection will be created if it does not exist
    const collection = db.collection(collectionName);

    // Check if there are existing documents
    let documents = await collection.find({}).toArray();

    if (documents.length === 0) {
      // Insert data into the collection
      const insertResult = await collection.insertMany(data);
      console.log("Inserted documents:", insertResult.insertedCount);
    } else {
      console.log("Gifts already exist in DB");
    }
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    // Close the connection
    await client.close();
  }
}

loadData().catch(console.error); // Catch any errors in the loadData function

module.exports = {
  loadData,
};
