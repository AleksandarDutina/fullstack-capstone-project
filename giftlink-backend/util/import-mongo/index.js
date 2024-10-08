require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

// Debug to check if .env variables are loaded correctly
console.log("MONGO_URL:", process.env.MONGO_URL);
console.log("DATASRC:", process.env.DATASRC);

// MongoDB connection URL
let url = `${process.env.MONGO_URL}`;
let filename = `${__dirname}/${process.env.DATASRC || "gifts.json"}`; // Add a fallback for DATASRC
const dbName = "giftdb";
const collectionName = "gifts";

// Check if the data source file exists
if (!fs.existsSync(filename)) {
  throw new Error(`File not found: ${filename}`);
}

let data;
try {
  console.log(`Loading data from: ${filename}`);
  const fileContent = fs.readFileSync(filename, "utf8");
  data = JSON.parse(fileContent).docs;
  if (!data) {
    throw new Error('No "docs" field found in JSON file.');
  }
} catch (error) {
  console.error("Error reading or parsing JSON file:", error);
  return;
}

// Connect to database and insert data into the collection
async function loadData() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let cursor = await collection.find({});
    let documents = await cursor.toArray();

    if (documents.length === 0) {
      const insertResult = await collection.insertMany(data);
      console.log("Inserted documents:", insertResult.insertedCount);
    } else {
      console.log("Gifts already exist in DB");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

loadData();

module.exports = {
  loadData,
};
