import mongoose from "mongoose";
import { Flat } from "./models/flatModel.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    console.error("MONGO_URL is not defined in env");
    process.exit(1);
}

await mongoose.connect(mongoUrl);

interface FlatSeedInput {
    flatNo: string;
    status: "unassigned" | "vacant" | "occupied";
    isApproved: "approved" | "pending" | "notApproved";
}

const flats: FlatSeedInput[] = [];

// push flats of A-block
for (let i = 1; i <= 120; i++) {
    flats.push({
        flatNo: `A${String(i).padStart(3, "0")}`,
        status: "unassigned",
        isApproved: "notApproved",
    });
}

// push flats of B-block
for (let i = 1; i <= 380; i++) {
    flats.push({
        flatNo: `B${String(i).padStart(3, "0")}`,
        status: "unassigned",
        isApproved: "notApproved",
    });
}

try {
    await Flat.insertMany(flats);
    console.log("500 flats inserted successfully");
    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}