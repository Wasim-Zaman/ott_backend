const mongoose = require("mongoose");
const { appLogger } = require("./logger");

require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 2000,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: "majority",
    });
    appLogger.info("MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      appLogger.warn("MongoDB disconnected! Attempting to reconnect...");
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on("error", (err) => {
      appLogger.error("MongoDB connection error:", err);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        appLogger.info("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        appLogger.error("Error during app termination:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    appLogger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
