const mongoose = require("mongoose");
const Parent = require("./Models/parentSchema");

const findRajesh = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0");
        const rajesh = await Parent.findOne({ name: /Rajesh/i });
        console.log("Rajesh found:", rajesh);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findRajesh();
