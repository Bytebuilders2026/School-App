const userModel = require("./Models/user.js");
const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
            .then(() => console.log("✅ MongoDB Connected: schoolApp"))
            .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};


const createAdmin = async () => {
    const user = new userModel({
        role: "admin",
        email: "rk4840369@gmail.com",
        password: "123456",
    });
    await user.save();
    console.log("Admin user created");
}

connectDb().then(() => {
    createAdmin()
})