import express from "express";
import { handleDeliveryWebhook } from "../controllers/webhookController.js";

const webhookRouter = express.Router();

// No auth middleware — secured via x-webhook-secret header , this route will be used to receive the incoming post requests from the Order Simulator.
webhookRouter.post("/delivery", handleDeliveryWebhook);

export default webhookRouter;