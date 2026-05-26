import mongoose from "mongoose";
import { Flat } from "./models/flatModel.js";
import dotenv from "dotenv";


dotenv.config();


await mongoose.connect(process.env.MONGO_URL);


const flats = [];

//push flats of A-block
for (let i = 1; i <= 120; i++) {
    flats.push({
        flatNo: `A${String(i).padStart(3, "0")}`,
        status: "vacant",
    })
}

//push flats of B-block
for (let i = 1; i <= 380; i++) {
    flats.push({
        flatNo: `B${String(i).padStart(3, "0")}`,
        status: "vacant",
    })
}


try {
    await Flat.insertMany(flats);


    console.log("500 flats inserted successfully");

    process.exit();
} catch (error) {
    console.log(error);

    process.exit(1);
}