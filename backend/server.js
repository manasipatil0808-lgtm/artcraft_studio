// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const sequelize = require("./src/config/database");

dotenv.config();

const app = require("./src/app");
const PORT = process.env.PORT || 5000;

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Don't auto-sync in production, use migrations instead
if (process.env.NODE_ENV === "development") {
  // Use { alter: false } to avoid altering existing tables
  sequelize
    .sync({ alter: false })
    .then(() => console.log("✅ Database tables checked"))
    .catch((err) => {
      console.error("❌ Sync error:", err.message);
      console.log("⚠️ Continuing without sync - make sure your tables exist");
    });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
