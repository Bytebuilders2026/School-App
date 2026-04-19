const mongoose = require("mongoose");
const Timetable = require("./Models/TimeTableSchema");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
            .then(() => console.log("✅ MongoDB Connected"))
            .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
    }
};

const teachers = {
    "1001": "69e376ed77a8841f27d1b24a", // Hindi
    "1002": "69e3772377a8841f27d1b24c", // English
    "1003": "69e3775a77a8841f27d1b24e", // Mathematics
    "1004": "69e3778e77a8841f27d1b250", // Mathematics
    "1005": "69e377c077a8841f27d1b252", // Science
    "1006": "69e377f177a8841f27d1b254", // S.Sci
    "1007": "69e3782377a8841f27d1b256", // I.T.
    "1010": "69e3793877a8841f27d1b25c", // Games
};

const timings = [
    { start: "08:00", end: "08:50" },
    { start: "08:50", end: "09:40" },
    { start: "09:40", end: "10:30" },
    { start: "10:30", end: "11:20" },
    { start: "11:40", end: "12:20" },
    { start: "12:20", end: "13:00" },
    { start: "13:00", end: "13:35" },
    { start: "13:35", end: "14:00" }, // Diary Period 
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const createTimetable = async () => {
    for (const day of days) {
        const periods = [
            { subject: "Mathematics", teacher: teachers["1003"], startTime: timings[0].start, endTime: timings[0].end },
            { subject: "English", teacher: teachers["1002"], startTime: timings[1].start, endTime: timings[1].end },
            { subject: "Hindi", teacher: teachers["1001"], startTime: timings[2].start, endTime: timings[2].end },
            { subject: "Social Science", teacher: teachers["1006"], startTime: timings[3].start, endTime: timings[3].end },
            { subject: "Science", teacher: teachers["1005"], startTime: timings[4].start, endTime: timings[4].end },
            { subject: "I.T.", teacher: teachers["1007"], startTime: timings[5].start, endTime: timings[5].end },
            { subject: "Games", teacher: teachers["1010"], startTime: timings[6].start, endTime: timings[6].end },
            { subject: "Diary Period", teacher: null, startTime: timings[7].start, endTime: timings[7].end },
        ];

        const tt = new Timetable({
            class: "8",
            section: "A",
            day,
            periods
        });

        await tt.save();
        console.log(`Timetable created for ${day}`);
    }
    process.exit();
};

connectDb().then(() => {
    createTimetable();
});
