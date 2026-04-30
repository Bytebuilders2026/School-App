const mongoose = require("mongoose");
const Parent = require("./Models/parentSchema");

const checkParents = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0");
        console.log("Connected to MongoDB");

        const allParents = await Parent.find({});
        console.log("Total Parents in parent collection:", allParents.length);
        allParents.forEach(p => console.log(`- Name: ${p.name}, Phone: ${p.phone}, Email: ${p.email}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkParents();
