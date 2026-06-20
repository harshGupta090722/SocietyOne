import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
    createParcel,
    getMyParcels,
    getAllParcels,
    receiveParcel,
    collectParcel
} from "../controllers/parcelController.js";

const parcelRouter = express.Router();

// All routes require authentication
parcelRouter.use(authMiddleware as any);

// Tenant/Landlord routes (any authenticated user can create/view their own parcels)
parcelRouter.post("/", upload.single("document"), createParcel);
parcelRouter.get("/my", getMyParcels);

// Admin routes (role check is done inside the controller or can be added via middleware)
parcelRouter.get("/all", getAllParcels);
parcelRouter.patch("/:id/receive", upload.single("document"), receiveParcel);
parcelRouter.patch("/:id/collect", collectParcel);

export default parcelRouter;