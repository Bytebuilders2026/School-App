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

const addRecess = async () => {
    try {
        const allTimetables = await Timetable.find({});
        console.log(`Found ${allTimetables.length} timetable entries. Adding Recess...`);

        for (const tt of allTimetables) {
            // Check if Recess already exists to avoid duplicates
            const hasRecess = tt.periods.some(p => p.startTime === "11:20" && p.endTime === "11:40");
            
            if (!hasRecess) {
                tt.periods.push({
                    subject: "Recess",
                    teacher: null,
                    startTime: "11:20",
                    endTime: "11:40"
                });
                // Sort periods by start time
                tt.periods.sort((a, b) => a.startTime.localeCompare(b.startTime));
                await tt.save();
                console.log(`✅ Added Recess to Class ${tt.class} - ${tt.section} (${tt.day})`);
            } else {
                console.log(`ℹ️ Recess already exists for ${tt.class} - ${tt.section} (${tt.day})`);
            }
        }

        console.log("\n✅ Recess (11:20 - 11:40) has been added to all timetables successfully.");
        process.exit();
    } catch (err) {
        console.error("❌ Error adding recess:", err.message);
        process.exit(1);
    }
};

connectDb().then(() => {
    addRecess();
});
