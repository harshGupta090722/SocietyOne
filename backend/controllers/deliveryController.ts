import { Request, Response } from "express";
import { DeliveryRequest } from "../models/deliveryModel.js";
import { User } from "../models/userModel.js";
import { Flat } from "../models/flatModel.js";
import { sendDeliveryNoticeEmail } from "../utils/mailer.js";

// Admin: Get all delivery requests
export const getAllDeliveries = async (req: Request, res: Response): Promise<any> => {
    try {
        const deliveries = await DeliveryRequest.find()
            .populate("flatId", "flatNo")
            .populate("tenantId", "firstName lastName email phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({ deliveries });
    } catch (error) {
        console.error("Error in getAllDeliveries:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Verify a delivery partner (triggers email to tenant)
export const verifyDelivery = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const delivery = await DeliveryRequest.findById(id);

        if (!delivery) {
            return res.status(404).json({ message: "Delivery request not found." });
        }

        if (delivery.status !== "Pending") {
            return res.status(400).json({ message: "Delivery is not in Pending status." });
        }

        const updateFields: any = {
            status: "Verified",
            verifiedAt: new Date()
        };

        const updated = await DeliveryRequest.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        // Fetch tenant details for email notification
        const tenant = await User.findById(delivery.tenantId);
        const flat = await Flat.findById(delivery.flatId);

        if (tenant && tenant.email) {
            try {
                await sendDeliveryNoticeEmail(
                    tenant.email,
                    tenant.firstName,
                    delivery.platform,
                    delivery.partnerName,
                    delivery.partnerPhone,
                    flat?.flatNo || "your flat"
                );
                console.log(`[Delivery] Notification email sent to ${tenant.email}`);
            } catch (emailError) {
                console.error("Failed to send delivery notification email:", emailError);
                // Don't fail the request if email fails
            }
        }

        return res.status(200).json({
            message: "Delivery verified and tenant notified.",
            delivery: updated
        });
    } catch (error) {
        console.error("Error in verifyDelivery:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Mark delivery as completed
export const completeDelivery = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const delivery = await DeliveryRequest.findById(id);

        if (!delivery) {
            return res.status(404).json({ message: "Delivery request not found." });
        }

        if (delivery.status !== "Verified") {
            return res.status(400).json({ message: "Delivery must be verified before marking as completed." });
        }

        const updated = await DeliveryRequest.findByIdAndUpdate(
            id,
            { $set: { status: "Completed", completedAt: new Date() } },
            { returnDocument: 'after' }
        );

        return res.status(200).json({
            message: "Delivery marked as completed.",
            delivery: updated
        });
    } catch (error) {
        console.error("Error in completeDelivery:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};