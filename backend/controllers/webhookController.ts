import { Request, Response } from "express";
import { DeliveryRequest } from "../models/deliveryModel.js";
import { Lease } from "../models/leaseModel.js";
import config from "../config/config.js";

// Webhook: Receive delivery request from Order Simulator
export const handleDeliveryWebhook = async (req: Request, res: Response): Promise<any> => {
    try {
        // Validate webhook secret
        const secret = req.headers["x-webhook-secret"];
        
        if (!secret || secret !== config.WEBHOOK_SECRET) {
            return res.status(401).json({ message: "Unauthorized: Invalid webhook secret." });
        }

        const { flatId, platform, partnerName, partnerPhone } = req.body;

        if (!flatId || !platform || !partnerName || !partnerPhone) {
            return res.status(400).json({ message: "Missing required fields: flatId, platform, partnerName, partnerPhone." });
        }

        // Find the active lease for this flat to get the tenantId
        const activeLease = await Lease.findOne({ flatId, status: "active" });

        if (!activeLease) {
            return res.status(404).json({ message: "No active tenant found for this flat." });
        }

        const tenantId = activeLease.tenantId;

        const deliveryRequest = new DeliveryRequest({
            flatId,
            tenantId,
            platform,
            partnerName,
            partnerPhone,
            status: "Pending"
        });

        await deliveryRequest.save();

        console.log(`[Webhook] Delivery request created: ${platform} - ${partnerName} for flat ${flatId}`);

        return res.status(201).json({
            message: "Delivery request received successfully.",
            deliveryRequest
        });
    } catch (error) {
        console.error("Error in handleDeliveryWebhook:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};