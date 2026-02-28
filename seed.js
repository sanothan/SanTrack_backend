require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const seedAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const emailAdmin = "admin@santrack.com";
        const emailInspector = "inspector@santrack.com";
        const password = await bcrypt.hash("password123", 10);

        // 1. Seed Admin
        const existingAdmin = await User.findOne({ email: emailAdmin });
        if (!existingAdmin) {
            await User.create({
                name: "System Admin",
                email: emailAdmin,
                password: password,
                role: "admin",
                phone: "555-0100"
            });
            console.log(`Created Admin account: ${emailAdmin} / password123`);
        } else {
            console.log("Admin account already exists.");
        }

        // 2. Seed Inspector
        const existingInspector = await User.findOne({ email: emailInspector });
        if (!existingInspector) {
            await User.create({
                name: "Field Inspector",
                email: emailInspector,
                password: password,
                role: "inspector",
                phone: "555-0101"
            });
            console.log(`Created Inspector account: ${emailInspector} / password123`);
        } else {
            console.log("Inspector account already exists.");
        }

        mongoose.disconnect();
        console.log("Seed script completed.");
        process.exit(0);
    } catch (error) {
        console.error("Seed script failed:", error);
        process.exit(1);
    }
};

seedAccounts();
