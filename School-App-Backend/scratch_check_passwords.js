const mongoose = require("mongoose");
const User = require("./Models/user");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
            .then(() => console.log("✅ MongoDB Connected"))
            .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};

const checkPasswords = async () => {
    const emails = ["rk4840369@gmail.com", "ranjeet@rsschool.edu.in", "sarthak@rsschool.edu.in", "9354997000@school.com"];
    for (const email of emails) {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`Email: ${user.email}, Role: ${user.role}, Password (Raw/Hashed): ${user.password}`);
        }
    }
    process.exit();
}

connectDb().then(() => {
    checkPasswords()
})
