import { Request, Response } from "express";
import { Flat } from "../models/flatModel.js";
import { Lease } from "../models/leaseModel.js";
import { User } from "../models/userModel.js";
import { Verification } from "../models/verificaionModel.js";
import { Document as LeaseDocument } from "../models/documentModel.js";

export const getDashboard = async (req: Request, res: Response): Promise<any> => {
    try {
        const totalFlats = await Flat.countDocuments();
        const occupiedFlats = await Flat.countDocuments({ status: "occupied" });
        const vacantFlats = await Flat.countDocuments({ status: "vacant" });
        const pendingApprovals = await Flat.countDocuments({ isApproved: "pending" });

        return res.status(200).json({
            success: true,
            totalFlats,
            occupiedFlats,
            vacantFlats,
            pendingApprovals,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getDashboard Admin Controller", error });
    }
};

export const getAllFlats = async (req: Request, res: Response): Promise<any> => {
    try {
        const flats = await Flat.find()
            .populate("ownerId", "firstName lastName email phone isVerified")
            .populate({
                path: "leaseId",
                populate: {
                    path: "tenantId",
                    select: "firstName lastName email phone isVerified"
                }
            });

        return res.status(200).json({
            success: true,
            flats
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllFlats Admin Controller", error });
    }
};

export const getDocumentVerifications = async (req: Request, res: Response): Promise<any> => {
    try {
        const verifications = await Verification.find()
            .populate("userId", "firstName lastName email role phone isVerified")
            .populate("flatId", "flatNo status isApproved")
            .populate("attempts.flatId", "flatNo status isApproved");

        const allRequests: any[] = [];
        for (const v of verifications) {
            // Push the current/latest request
            allRequests.push({
                _id: v._id,
                userId: v.userId,
                flatId: v.flatId,
                idProofUrl: v.idProofUrl,
                status: v.status,
                type: v.type,
                rejectionReason: v.rejectionReason,
                createdAt: v.updatedAt || v.createdAt
            });

            // Push past attempts
            if (v.attempts && v.attempts.length > 0) {
                v.attempts.forEach((attempt, index) => {
                    allRequests.push({
                        _id: `${v._id}-attempt-${index}`,
                        userId: v.userId,
                        flatId: attempt.flatId || v.flatId,
                        idProofUrl: attempt.idProofUrl,
                        status: attempt.status,
                        type: v.type,
                        rejectionReason: attempt.rejectionReason,
                        createdAt: attempt.submittedAt
                    });
                });
            }
        }

        // Sort all requests by date descending
        allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return res.status(200).json({
            success: true,
            verifications: allRequests
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getDocumentVerifications Admin Controller", error });
    }
};

export const handleDocumentVerification = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value. Must be 'approved' or 'rejected'." });
    }

    try {
        const verification = await Verification.findById(id);
        if (!verification) {
            return res.status(404).json({ success: false, message: "Verification request not found" });
        }

        verification.status = status;
        if (status === "rejected") {
            verification.rejectionReason = rejectionReason || "Document rejected by administrator";
        } else {
            verification.rejectionReason = "";
        }

        await verification.save();

        // Update User verification status ONLY if it is identity verification
        if (!verification.type || verification.type === "identity") {
            const isVerified = status === "approved";
            await User.findByIdAndUpdate(verification.userId, { isVerified });
        }

        // Update Flat approval status if flatId is present
        if (verification.flatId) {
            const flatStatus = status === "approved" ? "approved" : "notApproved";
            const flat = await Flat.findById(verification.flatId);
            if (flat) {
                flat.isApproved = flatStatus;
                if (verification.type === "ownership") {
                    if (status === "approved") {
                        flat.ownerId = verification.userId as any;
                        flat.status = "vacant";
                    } else {
                        flat.ownerId = null;
                        flat.status = "unassigned";
                    }
                }
                await flat.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: `Verification successfully ${status}`,
            verification
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in handleDocumentVerification Admin Controller", error });
    }
};

export const getAllLeases = async (req: Request, res: Response): Promise<any> => {
    try {
        const allLeases = await Lease.find()
            .populate("flatId")
            .populate("tenantId", "firstName lastName email phone isVerified")
            .populate("landlordId", "firstName lastName email phone isVerified")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            allLeases
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllLeases Admin Controller", error });
    }
};

export const getAllDocuments = async (req: Request, res: Response): Promise<any> => {
    try {
        const allDocuments = await LeaseDocument.find()
            .populate({
                path: "leaseId",
                populate: {
                    path: "flatId tenantId landlordId",
                    select: "flatNo firstName lastName email phone role isVerified"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            allDocuments
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllDocuments Admin Controller", error });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized Access" });
        }

        const adminDetails = await User.findById(userId);
        if (!adminDetails) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        return res.status(200).json({ success: true, adminDetails });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Error in getProfile Admin Controller", error });
    }
};