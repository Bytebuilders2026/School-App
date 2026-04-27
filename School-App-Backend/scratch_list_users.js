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

const listUsers = async () => {
    const users = await User.find({}, 'email role password');
    console.log("USERS_START");
    console.log(JSON.stringify(users, null, 2));
    console.log("USERS_END");
    process.exit();
}

connectDb().then(() => {
    listUsers()
})
