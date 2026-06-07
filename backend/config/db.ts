import mongoose from "mongoose";
import config from "../config/config.js";

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URL);
        console.log("You are now Connected to mongoDB");
        
        // Programmatically drop legacy unique index userId_1 on verifications
        try {
            const db = mongoose.connection.db;
            if (db) {
                await db.collection("verifications").dropIndex("userId_1");
                console.log("Successfully dropped duplicate unique index userId_1 on verifications");
            }
        } catch (indexErr: any) {
            console.log("Index userId_1 did not exist or was already dropped");
        }
    } catch (err) {
        console.error("Error in connecting to mongoDB", err);
    }
};

export default connectDB;
