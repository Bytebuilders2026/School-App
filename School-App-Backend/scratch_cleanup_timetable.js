const mongoose = require("mongoose");
const Timetable = require("./Models/TimeTableSchema");

mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0")
  .then(async () => {
    const result = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} timetable entries. Now re-generate from the UI with conflict-aware logic.`);
    process.exit();
  })
  .catch(err => { console.error(err.message); process.exit(1); });
