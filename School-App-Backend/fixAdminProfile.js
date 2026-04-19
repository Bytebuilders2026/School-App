const mongoose = require("mongoose");
const User = require("./Models/user");

mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
  .then(async () => {
    console.log("✅ MongoDB Connected: schoolApp");
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
        console.log("Found admin user:", adminUser._id);
        // Admin doesn't have a separate profile schema based on notificationController, it just uses its User ID.
        // Let's modify the controller instead so we don't break the database schema unexpectedly.
    }
    process.exit();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
