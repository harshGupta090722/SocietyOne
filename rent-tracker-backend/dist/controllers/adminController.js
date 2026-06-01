import { Flat } from "../models/flatModel.js";
import { Lease } from "../models/leaseModel.js";
import { User } from "../models/userModel.js";
import { Verification } from "../models/verificaionModel.js";
import { Document as LeaseDocument } from "../models/documentModel.js";
export const getDashboard = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getDashboard Admin Controller", error });
    }
};
export const getAllFlats = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllFlats Admin Controller", error });
    }
};
export const getDocumentVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find()
            .populate("userId", "firstName lastName email role phone isVerified")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            verifications
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getDocumentVerifications Admin Controller", error });
    }
};
export const handleDocumentVerification = async (req, res) => {
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
        }
        else {
            verification.rejectionReason = "";
        }
        await verification.save();
        // Update User verification status
        const isVerified = status === "approved";
        await User.findByIdAndUpdate(verification.userId, { isVerified });
        return res.status(200).json({
            success: true,
            message: `Verification successfully ${status}`,
            verification
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in handleDocumentVerification Admin Controller", error });
    }
};
export const getAllLeases = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllLeases Admin Controller", error });
    }
};
export const getAllDocuments = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getAllDocuments Admin Controller", error });
    }
};
export const getProfile = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Error in getProfile Admin Controller", error });
    }
};
