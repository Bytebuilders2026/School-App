const mongoose = require("mongoose");
const TeacherLeave = require("./Models/TeacherLeaveSchema");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
            .then(() => console.log("✅ MongoDB Connected"))
            .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};

const checkLeaves = async () => {
    const leaves = await TeacherLeave.find({ status: "Pending" }).populate("teacher", "name");
    console.log(JSON.stringify(leaves, null, 2));
    process.exit();
}

connectDb().then(() => {
    checkLeaves()
})
