import mongoose from "mongoose";
import dotenv from "dotenv";
import { Payment } from "./models/paymentModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URL || "");
  const payment = await Payment.findOne().sort({ createdAt: -1 });
  console.log(payment);
  process.exit(0);
}
run();