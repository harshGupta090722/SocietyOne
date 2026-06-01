import express from "express";
import config from "./config/config.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoute.js";
import landlordRouter from "./routes/landlordRoute.js";
import tenantRouter from "./routes/tenantRoute.js";
import leaseRouter from "./routes/leaseRoute.js";
import adminRouter from "./routes/adminRoutes.js";
import cors from "cors";

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = config.PORT;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/landlord", landlordRouter);
app.use("/api/v1/tenant", tenantRouter);
app.use("/api/v1/leases", leaseRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});