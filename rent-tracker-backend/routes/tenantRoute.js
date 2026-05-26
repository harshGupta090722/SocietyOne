import express from "express";
import { getDashboard, makePayment, viewPayments, uploadDocuments } from "../controllers/tenantController.js";
import { tenantMiddleware } from "../middleware/roleMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const tenantRouter = express.Router();

tenantRouter.use(authMiddleware, tenantMiddleware);

tenantRouter.get("/dashboard", getDashboard);
tenantRouter.post("/pay-rent", makePayment);
tenantRouter.get("/payments", viewPayments);
tenantRouter.post("/documents", upload.single("document"), uploadDocuments);

export default tenantRouter;