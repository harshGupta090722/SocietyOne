import { Request, Response } from "express";
import { Parcel } from "../models/parcelModel.js";
import { Lease } from "../models/leaseModel.js";

// Tenant/Landlord: Create a new parcel request
export const createParcel = async (req: Request, res: Response): Promise<any> => {
    try {
        const { platform, description, expectedDate } = req.body;

        if (!platform || !description) {
            return res.status(400).json({ message: "Platform and description are required." });
        }

        // Try to find the user's active lease to get their flat
        const lease = await Lease.findOne({ tenantId: req.userId, status: "active" });
        const flatId = lease?.flatId || undefined;

        const parcel = new Parcel({
            userId: req.userId,
            flatId,
            platform,
            description,
            expectedDate: expectedDate || undefined,
            orderScreenshotUrl: req.file ? req.file.path : undefined,
            status: "Pending"
        });

        await parcel.save();

        return res.status(201).json({
            message: "Parcel request created successfully.",
            parcel
        });
    } catch (error) {
        console.error("Error in createParcel:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Tenant/Landlord: Get all my parcels
export const getMyParcels = async (req: Request, res: Response): Promise<any> => {
    try {
        const parcels = await Parcel.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({ parcels });
    } catch (error) {
        console.error("Error in getMyParcels:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Get all parcels (for gate management)
export const getAllParcels = async (req: Request, res: Response): Promise<any> => {
    try {
        const parcels = await Parcel.find()
            .populate("userId", "firstName lastName email phone")
            .populate("flatId", "flatNumber floor block")
            .sort({ createdAt: -1 });

        return res.status(200).json({ parcels });
    } catch (error) {
        console.error("Error in getAllParcels:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Mark parcel as received at gate (with photo upload)
export const receiveParcel = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const parcel = await Parcel.findById(id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found." });
        }

        if (parcel.status !== "Pending") {
            return res.status(400).json({ message: "Parcel is not in Pending status." });
        }

        const updateFields: any = {
            status: "ReceivedAtGate",
            receivedAt: new Date()
        };
        
        if (req.file) {
            updateFields.gatePhotoUrl = req.file.path;
        }
        if (adminNote) {
            updateFields.adminNote = adminNote;
        }

        const updated = await Parcel.findByIdAndUpdate(
            id, 
            { $set: updateFields }, 
            { new: true }
        );

        return res.status(200).json({
            message: "Parcel marked as received at gate.",
            parcel: updated
        });
    } catch (error) {
        console.error("Error in receiveParcel:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin: Mark parcel as collected by resident
export const collectParcel = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const parcel = await Parcel.findById(id);

        if (!parcel) {
            return res.status(404).json({ message: "Parcel not found." });
        }

        if (parcel.status !== "ReceivedAtGate") {
            return res.status(400).json({ message: "Parcel must be at gate before it can be collected." });
        }

        const updated = await Parcel.findByIdAndUpdate(
            id, 
            { $set: { status: "Collected", collectedAt: new Date() } }, 
            { new: true }
        );

        return res.status(200).json({
            message: "Parcel marked as collected.",
            parcel: updated
        });
    } catch (error) {
        console.error("Error in collectParcel:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};