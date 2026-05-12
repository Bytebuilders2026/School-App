const mongoose = require("mongoose");
const User = require("./Models/user");
const bcrypt = require("bcryptjs");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
            .then(() => console.log("✅ MongoDB Connected"))
            .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};

const resetPassword = async () => {
    const email = "ranjeet@rsschool.edu.in";
    const user = await User.findOne({ email });
    if (user) {
        user.password = "123456"; 
        await user.save();
        console.log("✅ Password reset for ranjeet@rsschool.edu.in to 123456");
    } else {
        console.log("❌ User not found");
    }
    process.exit();
}

connectDb().then(() => {
    resetPassword()
})
