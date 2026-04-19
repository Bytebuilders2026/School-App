const mongoose = require("mongoose");
const Timetable = require("./Models/TimeTableSchema");
const Teacher = require("./Models/TeacherSchema");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0");
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};

const checkTimetable = async () => {
    const teacherId = "69e376ed77a8841f27d1b249"; // Ranjeet's user ID
    const teacherProfile = await Teacher.findOne({ user: teacherId });
    console.log("Profile:", teacherProfile._id);

    const allEntries = await Timetable.find({ "periods.teacher": teacherProfile._id });
    const timetable = allEntries.map((entry) => ({
      _id: entry._id, class: entry.class, section: entry.section, day: entry.day,
      periods: entry.periods.filter((p) => p.teacher?.toString() === teacherProfile._id.toString()),
    }));

    console.log(JSON.stringify(timetable, null, 2));
    process.exit();
}

connectDb().then(() => {
    checkTimetable()
})
