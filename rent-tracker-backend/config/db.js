import mongoose from "mongoose";
import config from "../config/config.js";


const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URL);
        console.log("You are now Connected to mongoDB")
    } catch (err) {
        console.log("Error in connecting to mongoDB", err);
    }
}

export default connectDB;