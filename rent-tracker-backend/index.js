import express from "express";
import config from "./config/config.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


connectDB();
const app = express();


app.use(express.json());

const PORT = config.PORT;



app.use("/api/v1/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})