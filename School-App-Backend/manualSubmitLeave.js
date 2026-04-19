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

const submitLeave = async () => {
    const teacherId = "69e376ed77a8841f27d1b24a"; // Ms. Ranjeet
    const startDate = "2026-04-20";
    const endDate = "2026-04-20";
    const reason = "Health issues (submitted by Assistant)";
    const totalDays = 1;

    const leave = await TeacherLeave.create({
        teacher: teacherId,
        startDate,
        endDate,
        reason,
        totalDays,
        status: "Pending"
    });

    console.log("✅ Leave submitted successfully:", leave);
    process.exit();
}

connectDb().then(() => {
    submitLeave()
})
