import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI || "").then(async () => {
    console.log("Connected");
    const { Parcel } = await import("./models/parcelModel.js");
    const parcels = await Parcel.find().sort({createdAt: -1}).limit(3);
    console.log(JSON.stringify(parcels, null, 2));
    process.exit(0);
});
