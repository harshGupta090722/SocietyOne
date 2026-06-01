import express from "express";
import { 
  getDashboard, 
  makePayment, 
  viewPayments, 
  uploadDocuments, 
  tenantVerification,
  getVacantFlats,
  requestRent
} from "../controllers/tenantController.js";
import { getProfile } from "../controllers/landlordController.js";
import { tenantMiddleware } from "../middleware/roleMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const tenantRouter = express.Router();

tenantRouter.use(authMiddleware as any, tenantMiddleware as any);

tenantRouter.get("/dashboard", getDashboard);
tenantRouter.post("/pay-rent", makePayment);
tenantRouter.get("/payments", viewPayments);
tenantRouter.post("/documents", upload.single("document"), uploadDocuments);
tenantRouter.post("/verify", upload.single("document"), tenantVerification);
tenantRouter.get("/profile", getProfile);
tenantRouter.get("/vacant-flats", getVacantFlats);
tenantRouter.post("/request-rent", upload.single("document"), requestRent);

export default tenantRouter;
