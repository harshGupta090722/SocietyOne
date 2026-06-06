import { User } from "../models/userModel.js";
import { Flat } from "../models/flatModel.js";
import { Payment } from "../models/paymentModel.js";
import { Lease } from "../models/leaseModel.js";
import { Document } from "../models/documentModel.js";
import { Verification } from "../models/verificaionModel.js";
export const getDashboard = async (req, res) => {
    try {
        // Fetch tenant using req.userId set by authMiddleware
        const tenant = await User.findById(req.userId);
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }
        const tenantName = `${tenant.firstName} ${tenant.lastName}`;
        const activeLease = await Lease.findOne({ tenantId: req.userId, status: "active" });
        if (!activeLease) {
            return res.status(200).json({
                success: true,
                message: "No flat assigned currently",
                tenantName,
                flatAssigned: false
            });
        }
        const flat = await Flat.findById(activeLease.flatId);
        if (!flat) {
            return res.status(404).json({ success: false, message: "Assigned flat not found in database" });
        }
        const flatNo = flat.flatNo;
        const status = flat.status;
        let leaseDetails = activeLease;
        let documentDetails = await Document.findOne({ leaseId: activeLease._id });
        let payments = await Payment.find({ leaseId: activeLease._id }).sort({ paymentDate: -1 });
        let outstandingDue = 0;
        if (leaseDetails) {
            // Auto-calculate outstanding rent dues dynamically
            const start = new Date(leaseDetails.startDate);
            const now = new Date();
            const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
            const totalExpectedRent = Math.max(0, months * leaseDetails.monthlyRent);
            let totalPaidApproved = payments
                .filter(p => p.status === "approved")
                .reduce((sum, p) => sum + p.amount, 0);
            // Deduct security deposit so it is kept separate from active rent dues
            if (totalPaidApproved > 0) {
                totalPaidApproved = Math.max(0, totalPaidApproved - leaseDetails.securityDeposit);
            }
            outstandingDue = Math.max(0, totalExpectedRent - totalPaidApproved);
        }
        return res.status(200).json({
            success: true,
            tenantName,
            flatAssigned: true,
            flatNo,
            flatStatus: status,
            lease: leaseDetails,
            documents: documentDetails,
            payments,
            outstandingDue
        });
    }
    catch (error) {
        console.error("Error in getDashboard TenantController:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export const makePayment = async (req, res) => {
    try {
        const tenant = await User.findById(req.userId);
        const activeLease = await Lease.findOne({ tenantId: req.userId, status: "active" });
        if (!activeLease) {
            return res.status(400).json({
                success: false,
                message: "No active lease found. Please contact the landlord."
            });
        }
        const flat = await Flat.findById(activeLease.flatId);
        if (!flat) {
            return res.status(400).json({
                success: false,
                message: "No active flat assigned. Please contact the landlord."
            });
        }
        const { amount, screenshotURL } = req.body;
        if (!amount || !screenshotURL) {
            return res.status(400).json({
                success: false,
                message: "Amount and screenshot URL are required."
            });
        }
        // Generate a clean, unique payment ID
        const paymentId = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const payment = new Payment({
            paymentId,
            leaseId: activeLease._id,
            tenantId: req.userId,
            amount: Number(amount),
            screenshotURL,
            status: "pending"
        });
        await payment.save();
        return res.status(201).json({
            success: true,
            message: "Payment screenshot submitted successfully! Awaiting landlord approval.",
            data: payment
        });
    }
    catch (error) {
        console.error("Error in makePayment TenantController:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export const viewPayments = async (req, res) => {
    try {
        const tenant = await User.findById(req.userId);
        const activeLease = await Lease.findOne({ tenantId: req.userId, status: "active" });
        if (!activeLease) {
            return res.status(200).json({ success: true, data: [] });
        }
        const payments = await Payment.find({ leaseId: activeLease._id }).sort({ paymentDate: -1 });
        return res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        console.error("Error in viewPayments TenantController:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export const uploadDocuments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
            message: "File uploaded successfully",
            fileUrl
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const tenantVerification = async (req, res) => {
    try {
        const tenantId = req.userId;
        const user = await User.findById(tenantId);
        if (!user) {
            return res.status(404).json({ message: "Tenant user not found." });
        }
        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }
        else if (req.body.documentUrl) {
            fileUrl = req.body.documentUrl;
        }
        if (!fileUrl) {
            return res.status(400).json({ message: "Identity proof document is required for verification." });
        }
        // Check if a verification request already exists
        let verification = await Verification.findOne({ userId: tenantId, type: "identity" });
        if (verification) {
            // Push current state to attempts log
            verification.attempts.push({
                idProofUrl: verification.idProofUrl,
                status: verification.status,
                rejectionReason: verification.rejectionReason || "",
                flatId: verification.flatId,
                submittedAt: verification.updatedAt || new Date()
            });
            // Update existing verification request to pending
            verification.idProofUrl = fileUrl;
            verification.status = "pending";
            verification.rejectionReason = "";
            await verification.save();
        }
        else {
            // Create a new verification request
            verification = new Verification({
                userId: tenantId,
                idProofUrl: fileUrl,
                type: "identity",
                status: "pending"
            });
            await verification.save();
        }
        // Make sure user's isVerified is false (or remains false) while request is pending
        user.isVerified = false;
        await user.save();
        return res.status(200).json({
            message: "Identity verification request submitted successfully. Status is now pending administrator approval.",
            verification,
            user
        });
    }
    catch (error) {
        console.error("Error in tenantVerification:", error);
        return res.status(500).json({ message: error.message });
    }
};
import crypto from "crypto";
export const getVacantFlats = async (req, res) => {
    try {
        const flats = await Flat.find({ status: "vacant", isApproved: "approved" }).populate("ownerId", "firstName lastName phone");
        return res.status(200).json({ success: true, flats });
    }
    catch (error) {
        console.error("Error in getVacantFlats:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const requestRent = async (req, res) => {
    try {
        const { flatId } = req.body;
        const tenantId = req.userId;
        if (!flatId) {
            return res.status(400).json({ message: "Flat ID is required." });
        }
        const flat = await Flat.findById(flatId);
        if (!flat) {
            return res.status(404).json({ message: "Flat not found." });
        }
        if (flat.status !== "vacant") {
            return res.status(400).json({ message: "This flat is not vacant." });
        }
        if (!flat.ownerId) {
            return res.status(400).json({ message: "This flat does not have an owner/landlord assigned." });
        }
        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }
        else if (req.body.documentUrl) {
            fileUrl = req.body.documentUrl;
        }
        if (!fileUrl) {
            return res.status(400).json({ message: "Payment screenshot document is required." });
        }
        // 1. Create the Lease record (starts active but the Flat isn't occupied or bound yet)
        const rentAmount = parseFloat(flat.monthlyRent || "0");
        const depositAmount = parseFloat(flat.securityDeposit || "0");
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1); // 1-year default lease duration
        const lease = new Lease({
            flatId: flat._id,
            landlordId: flat.ownerId,
            tenantId: tenantId,
            monthlyRent: rentAmount,
            securityDeposit: depositAmount,
            startDate,
            endDate,
            status: "active"
        });
        await lease.save();
        // 2. Create the Payment record linking to the Lease
        const paymentId = "PAY-" + crypto.randomBytes(4).toString("hex").toUpperCase();
        const payment = new Payment({
            paymentId,
            leaseId: lease._id,
            tenantId,
            amount: depositAmount + rentAmount, // Security Deposit + First month rent
            screenshotURL: fileUrl,
            status: "pending"
        });
        await payment.save();
        return res.status(201).json({
            message: "Property request submitted successfully. Awaiting landlord payment verification.",
            lease,
            payment
        });
    }
    catch (error) {
        console.error("Error in requestRent:", error);
        return res.status(500).json({ message: error.message });
    }
};
