/*jshint esversion: 8 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoLogger = require("./logger");

const connectToDatabase = require("./models/db");
const { loadData } = require("./util/import-mongo/index.js");

const app = express();
app.use("*", cors());
const port = 3060;

app.use(express.json());

// Route files
const giftRoutes = require("./routes/giftRoutes");
const searchRoutes = require("./routes/searchRoutes");

const pinoHttp = require("pino-http");
const logger = require("./logger");
app.use(pinoHttp({ logger }));

// Connect to MongoDB and load data
connectToDatabase()
  .then(async () => {
    pinoLogger.info("Connected to DB");
    // Load the data into the database only after a successful connection
    await loadData()
      .then(() => {
        pinoLogger.info("Data loaded successfully into DB");
      })
      .catch((e) => {
        console.error("Failed to load data", e);
      });
  })
  .catch((e) => console.error("Failed to connect to DB", e));

// Use Routes
app.use("/api/gifts", giftRoutes);
app.use("/api/search", searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.get("/", (req, res) => {
  res.send("Inside the server");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
