import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { landlordMiddleware } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { getFinances, viewLeases, viewPayments, addProperty, updatePaymentStatus, uploadDocuments, getProperties, getProfile, identityVerification } from "../controllers/landlordController.js";
const landlordRouter = express.Router();
// Protect all routes below this line
landlordRouter.use(authMiddleware, landlordMiddleware);
landlordRouter.get("/finances", getFinances);
landlordRouter.get("/leases", viewLeases);
landlordRouter.get("/payments", viewPayments);
landlordRouter.get("/properties", getProperties);
landlordRouter.post("/addproperty", addProperty);
landlordRouter.post("/payments/:paymentId/status", updatePaymentStatus);
landlordRouter.post("/documents", upload.single("document"), uploadDocuments);
landlordRouter.post("/identityVerification", upload.single("document"), identityVerification);
landlordRouter.get("/profile", getProfile);
export default landlordRouter;
