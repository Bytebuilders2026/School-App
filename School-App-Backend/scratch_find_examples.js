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

const findExampleUsers = async () => {
    const roles = ["admin", "teacher", "student", "parent"];
    for (const role of roles) {
        const user = await User.findOne({ role }, 'email role');
        if (user) {
            console.log(`Role: ${role}, Email: ${user.email}`);
        } else {
            console.log(`Role: ${role}, Not found`);
        }
    }
    process.exit();
}

connectDb().then(() => {
    findExampleUsers()
})
