const mongoose = require("mongoose");
const User = require("./Models/user");

const checkUser = async () => {
    try {
        await mongoose.connect("mongodb+srv://bytebuilder2025_db_user:L4ocWYO4civ7AqzE@cluster0.pq1w5lx.mongodb.net/?appName=Cluster0");
        console.log("Connected to MongoDB");

        const user = await User.findOne({ phone: "9034260910", role: "parent" });
        console.log("User found:", user);

        const allParents = await User.find({ role: "parent" });
        console.log("Total Parents in User collection:", allParents.length);
        allParents.forEach(p => console.log(`- ${p.phone} / ${p.email}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
