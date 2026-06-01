import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { landlordMiddleware } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
    getFinances,
    viewLeases,
    viewPayments,
    addProperty,
    updatePaymentStatus,
    uploadDocuments,
    getProperties,
    getProfile,
    identityVerification,
    getDashboard
} from "../controllers/landlordController.js";

const landlordRouter = express.Router();

// Protect all routes below this line
landlordRouter.use(authMiddleware as any, landlordMiddleware as any);

landlordRouter.get("/finances", getFinances);
landlordRouter.get("/leases", viewLeases);
landlordRouter.get("/payments", viewPayments);
landlordRouter.get("/dashboard", getDashboard);
landlordRouter.get("/properties", getProperties);
landlordRouter.post("/addproperty", upload.single("document"), addProperty);
landlordRouter.post("/payments/:paymentId/status", updatePaymentStatus);
landlordRouter.post("/documents", upload.single("document"), uploadDocuments);
landlordRouter.post("/identityVerification", upload.single("document"), identityVerification);
landlordRouter.get("/profile", getProfile); 

export default landlordRouter;