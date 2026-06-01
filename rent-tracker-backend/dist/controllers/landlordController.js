import { Lease } from "../models/leaseModel.js";
import { Payment } from "../models/paymentModel.js";
import { Flat } from "../models/flatModel.js";
import { User } from "../models/userModel.js";
import { Verification } from "../models/verificaionModel.js";
export const getFinances = async (req, res) => {
    let totalRent = 0;
    let totalSecurityDeposit = 0;
    try {
        // Since landlordId is not in the Lease model, fetch flats owned by landlord first
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.leaseId).filter(id => id != null);
        const leases = await Lease.find({ _id: { $in: leaseIds } });
        leases.forEach(lease => {
            totalRent += lease.monthlyRent;
            totalSecurityDeposit += lease.securityDeposit;
        });
        return res.status(200).json({ totalRent, totalSecurityDeposit });
    }
    catch (error) {
        console.error("Error in getFinances:", error);
        return res.status(500).json({ message: "Error fetching finances" });
    }
};
export const viewLeases = async (req, res) => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.leaseId).filter(id => id != null);
        const leases = await Lease.find({ _id: { $in: leaseIds } }).populate("flatId");
        return res.status(200).json({ leases });
    }
    catch (error) {
        console.error("Error in viewLeases:", error);
        return res.status(500).json({ message: "Error fetching leases" });
    }
};
export const viewPayments = async (req, res) => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.leaseId).filter(id => id != null);
        const payments = await Payment.find({ leaseId: { $in: leaseIds } }).populate("tenantId");
        return res.status(200).json({ payments });
    }
    catch (error) {
        console.error("Error in viewPayments:", error);
        return res.status(500).json({ message: "Error fetching payments" });
    }
};
export const addProperty = async (req, res) => {
    const { flatNo, monthlyRent, securityDeposit } = req.body;
    try {
        const flat = await Flat.findOne({ flatNo: flatNo });
        if (!flat) {
            return res.status(404).json({ message: `Flat ${flatNo} not found in the society database.` });
        }
        if (flat.status != 'unassigned') {
            return res.status(400).json({ message: `Flat ${flatNo} is already assigned.` });
        }
        // If the flat is already owned by someone else
        if (flat.ownerId && flat.ownerId.toString() !== req.userId) {
            return res.status(400).json({ message: `Flat ${flatNo} is already registered by another landlord.` });
        }
        flat.ownerId = req.userId;
        flat.leaseId = null;
        flat.monthlyRent = monthlyRent;
        flat.securityDeposit = securityDeposit;
        flat.status = "vacant";
        await flat.save();
        return res.status(200).json({
            message: "Flat added to your property successfully",
            flat,
        });
    }
    catch (error) {
        console.log("Error in addProperty landlord Controller.", error);
        return res.status(500).json({ message: error.message });
    }
};
export const updatePaymentStatus = async (req, res) => {
    const paymentId = req.params.paymentId;
    const status = req.body.status;
    try {
        const payment = await Payment.findOneAndUpdate({ paymentId: paymentId }, { status: status }, { new: true });
        return res.status(200).json({ message: "Payment status updated successfully", payment });
    }
    catch (error) {
        console.log("Error in payment updation", error);
        return res.status(500).json({ message: "Error in payment Updation" });
    }
};
export const uploadDocuments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
            message: "File uploaded successfully",
            fileUrl
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
export const getProperties = async (req, res) => {
    try {
        const flats = await Flat.find({ ownerId: req.userId });
        return res.status(200).json({ message: "Properties fetched successfully", flats });
    }
    catch (error) {
        console.error("Error in getProperties:", error);
        return res.status(500).json({ message: "Error fetching properties" });
    }
};
export const identityVerification = async (req, res) => {
    const landlordId = req.userId;
    try {
        const user = await User.findById(landlordId);
        if (!user) {
            return res.status(404).json({ message: "Landlord not found" });
        }
        // Determine the uploaded file path
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
        let verification = await Verification.findOne({ userId: landlordId });
        if (verification) {
            // Update existing verification request to pending
            verification.idProofUrl = fileUrl;
            verification.status = "pending";
            verification.rejectionReason = "";
            await verification.save();
        }
        else {
            // Create a new verification request
            verification = new Verification({
                userId: landlordId,
                idProofUrl: fileUrl,
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
        console.error("Error in identityVerification:", error);
        return res.status(500).json({ message: error.message });
    }
};
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        return res.status(200).json({ message: "Profile fetched successfully", user });
    }
    catch (error) {
        console.error("Error in getProfile:", error);
        return res.status(500).json({ message: "Error fetching profile" });
    }
};
