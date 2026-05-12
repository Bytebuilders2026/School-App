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

const resetTeacherPasswords = async () => {
    try {
        const teachers = await User.find({ role: "teacher" });
        console.log(`Found ${teachers.length} teachers. Hashing passwords now...`);

        for (const teacher of teachers) {
            // Force modification
            teacher.password = "TEMP_PWD_123"; 
            await teacher.save();
            
            teacher.password = "1234";
            await teacher.save();
            console.log(`✅ Reset & Hashed password for: ${teacher.email}`);
        }
        
        console.log("\n✅ All teacher passwords have been reset to '1234' and securely hashed.");
        process.exit();
    } catch (err) {
        console.error("❌ Error resetting passwords:", err.message);
        process.exit(1);
    }
}

connectDb().then(() => {
    resetTeacherPasswords();
});
