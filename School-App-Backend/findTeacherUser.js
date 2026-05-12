const mongoose = require("mongoose");
const Teacher = require("./Models/TeacherSchema");
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

const findTeacherUser = async () => {
    const teacher = await Teacher.findOne({ user: { $exists: true, $ne: null } }).populate("user");
    console.log(JSON.stringify(teacher, null, 2));
    process.exit();
}

connectDb().then(() => {
    findTeacherUser()
})
