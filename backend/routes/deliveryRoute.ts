import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    getAllDeliveries,
    verifyDelivery,
    completeDelivery
} from "../controllers/deliveryController.js";

const deliveryRouter = express.Router();

// All delivery management routes require authentication (admin)
deliveryRouter.use(authMiddleware as any);

deliveryRouter.get("/all", getAllDeliveries);
deliveryRouter.patch("/:id/verify", verifyDelivery);
deliveryRouter.patch("/:id/complete", completeDelivery);

export default deliveryRouter;
