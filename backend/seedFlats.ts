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
    images: {
        bedroom: string;
        hall: string;
        kitchen: string;
        bathroom: string;
    };
}

const DEFAULT_IMAGES = {
  bedroom: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
  hall: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
  kitchen: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
  bathroom: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"
};

const flats: FlatSeedInput[] = [];

// push flats of A-block
for (let i = 1; i <= 120; i++) {
    const flatNo = `A${String(i).padStart(3, "0")}`;
    flats.push({
        flatNo,
        status: "unassigned",
        isApproved: "notApproved",
        images: {
            bedroom: DEFAULT_IMAGES.bedroom,
            hall: DEFAULT_IMAGES.hall,
            kitchen: DEFAULT_IMAGES.kitchen,
            bathroom: DEFAULT_IMAGES.bathroom,
        }
    });
}

// push flats of B-block
for (let i = 1; i <= 380; i++) {
    const flatNo = `B${String(i).padStart(3, "0")}`;
    flats.push({
        flatNo,
        status: "unassigned",
        isApproved: "notApproved",
        images: {
            bedroom: DEFAULT_IMAGES.bedroom,
            hall: DEFAULT_IMAGES.hall,
            kitchen: DEFAULT_IMAGES.kitchen,
            bathroom: DEFAULT_IMAGES.bathroom,
        }
    });
}

try {
    await Flat.deleteMany({});
    console.log("Cleared existing flats");
    
    await Flat.insertMany(flats);
    console.log("500 flats inserted successfully");
    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}