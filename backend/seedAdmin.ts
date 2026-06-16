import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./models/userModel.js";

// Load environment variables
dotenv.config();

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    console.error("MONGO_URL is not defined in env");
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log("Connected to MongoDB");

        // Admin credentials to seed
        const adminData = {
            firstName: "admin",
            lastName: "admin",
            email: "admin@gmail.com",
            password: "admin", // You can change this before running the script
            phone: "0000000000",
            role: "admin",
            isVerified: true,
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            console.log("An admin account already exists. Skipping seeding.");
            process.exit(0);
        }

        // Check if email is taken
        const existingEmail = await User.findOne({ email: adminData.email });
        if (existingEmail) {
            console.log(`Email ${adminData.email} is already taken. Please change the admin email.`);
            process.exit(1);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        
        // Create new admin user
        const adminUser = new User({
            ...adminData,
            password: hashedPassword,
        });

        await adminUser.save();
        console.log("Admin account successfully seeded!");
        console.log(`Email: ${adminData.email}`);
        console.log(`Password: ${adminData.password}`);
        
    } catch (error) {
        console.error("Error seeding admin account:", error);
    } finally {
        // Disconnect from database
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    }
};

seedAdmin();