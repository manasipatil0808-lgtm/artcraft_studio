// server.js
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
  // Run migration to update ENUMs before sync
  const runMigrations = async () => {
    try {
      // Step 1: Update users role ENUM (add new values first, then migrate data)
      await sequelize.query(`
        ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'customer', 'seller') DEFAULT 'customer'
      `).catch(() => console.log("ℹ️  Users role column already updated or doesn't exist yet"));
      
      // Step 2: Migrate existing role data
      await sequelize.query(`UPDATE users SET role = 'customer' WHERE role = 'user'`).catch(() => {});
      await sequelize.query(`UPDATE users SET role = 'seller' WHERE role = 'admin'`).catch(() => {});
      
      // Step 3: Update orders status ENUM  
      await sequelize.query(`
        ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending'
      `).catch(() => console.log("ℹ️  Orders status column already updated or doesn't exist yet"));

      console.log("✅ Migrations completed");
    } catch (err) {
      console.log("ℹ️  Migration skipped (tables may not exist yet):", err.message);
    }

    // Step 4: Now sync with alter to finalize ENUM to exact values
    try {
      await sequelize.sync({ alter: true });
      console.log("✅ Database tables synced");
    } catch (err) {
      console.error("❌ Sync error:", err.message);
      console.log("⚠️ Continuing without sync - make sure your tables exist");
    }
  };

  runMigrations();
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
