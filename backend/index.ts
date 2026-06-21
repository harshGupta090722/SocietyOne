import express from "express";
import config from "./config/config.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoute.js";
import landlordRouter from "./routes/landlordRoute.js";
import tenantRouter from "./routes/tenantRoute.js";
import leaseRouter from "./routes/leaseRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import complaintRouter from "./routes/complaintRoute.js";
import parcelRouter from "./routes/parcelRoute.js";
import webhookRouter from "./routes/webhookRoute.js";
import deliveryRouter from "./routes/deliveryRoute.js";
import cors from "cors";

connectDB();
const app = express();

//This is the starting file

app.use(cors());
app.use(express.json());

const PORT = config.PORT;

app.get("/api/v1/test", (req, res) => {
    res.send("Society One is running successfully!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/landlord", landlordRouter);
app.use("/api/v1/tenant", tenantRouter);
app.use("/api/v1/leases", leaseRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/parcels", parcelRouter);
app.use("/api/v1/deliveries", deliveryRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});