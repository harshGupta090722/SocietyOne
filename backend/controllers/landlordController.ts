import { Request, Response } from "express";
import { Lease } from "../models/leaseModel.js";
import { Payment } from "../models/paymentModel.js";
import { Flat } from "../models/flatModel.js";
import { User } from "../models/userModel.js";
import { Verification } from "../models/verificaionModel.js";

export const getFinances = async (req: Request, res: Response): Promise<any> => {
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
    } catch (error) {
        console.error("Error in getFinances:", error);
        return res.status(500).json({ message: "Error fetching finances" });
    }
};

export const viewLeases = async (req: Request, res: Response): Promise<any> => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.leaseId).filter(id => id != null);

        const leases = await Lease.find({ _id: { $in: leaseIds } }).populate("flatId").populate("tenantId");
        return res.status(200).json({ leases });
    } catch (error) {
        console.error("Error in viewLeases:", error);
        return res.status(500).json({ message: "Error fetching leases" });
    }
};

export const viewPayments = async (req: Request, res: Response): Promise<any> => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const flatIds = landlordFlats.map(f => f._id);
        const landlordLeases = await Lease.find({ flatId: { $in: flatIds } });
        const leaseIds = landlordLeases.map(l => l._id);

        const payments = await Payment.find({ leaseId: { $in: leaseIds } })
            .populate("tenantId", "firstName lastName email phone")
            .populate({
                path: "leaseId",
                populate: {
                    path: "flatId",
                    select: "flatNo status isApproved monthlyRent securityDeposit"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ payments });
    } catch (error) {
        console.error("Error in viewPayments:", error);
        return res.status(500).json({ message: "Error fetching payments" });
    }
};

export const addProperty = async (req: Request, res: Response): Promise<any> => {
    const { flatNo, monthlyRent, securityDeposit } = req.body;
    try {
        const flat = await Flat.findOne({ flatNo: flatNo });

        if (!flat) {
            return res.status(404).json({ message: `Flat ${flatNo} not found in the society database.` });
        }

        // If flat is already owned by someone else and approved
        if (flat.ownerId && flat.isApproved === 'approved' && flat.ownerId.toString() !== req.userId) {
            return res.status(400).json({ message: `Flat ${flatNo} is already registered by another landlord.` });
        }

        // If flat is pending approval for someone else
        if (flat.ownerId && flat.isApproved === 'pending' && flat.ownerId.toString() !== req.userId) {
            return res.status(400).json({ message: `Flat ${flatNo} registration is pending approval for another landlord.` });
        }

        // If flat is already approved for the same landlord
        if (flat.ownerId && flat.isApproved === 'approved' && flat.ownerId.toString() === req.userId) {
            return res.status(400).json({ message: `Flat ${flatNo} is already registered and approved for you.` });
        }

        // If flat is pending approval for the same landlord
        if (flat.ownerId && flat.isApproved === 'pending' && flat.ownerId.toString() === req.userId) {
            return res.status(400).json({ message: "Request already exists for the property, Please wait for admin approval" });
        }

        // Check if an ownership verification request already exists for this landlord AND this specific flat
        let verification = await Verification.findOne({
            userId: req.userId,
            flatId: flat._id,
            type: "ownership"
        });

        if (verification) {
            if (verification.status === "pending") {
                return res.status(400).json({ message: "Request already exists for the property, Please wait for admin approval" });
            }
            if (verification.status === "approved") {
                return res.status(400).json({ message: `Flat ${flatNo} is already registered and approved for you.` });
            }
        }

        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.documentUrl) {
            fileUrl = req.body.documentUrl;
        }

        if (!fileUrl) {
            return res.status(400).json({ message: "Ownership proof document is required." });
        }

        flat.ownerId = req.userId as any;
        flat.leaseId = null;
        flat.monthlyRent = monthlyRent;
        flat.securityDeposit = securityDeposit;
        flat.status = "vacant";
        flat.isApproved = "pending";

        await flat.save();

        if (verification) {
            // Push current state to attempts log
            verification.attempts.push({
                idProofUrl: verification.idProofUrl,
                status: verification.status,
                rejectionReason: verification.rejectionReason || "",
                flatId: verification.flatId,
                submittedAt: (verification as any).updatedAt || new Date()
            });

            // Update existing verification request to pending
            verification.idProofUrl = fileUrl;
            verification.status = "pending";
            verification.rejectionReason = "";
            await verification.save();
        } else {
            // Create a new verification request
            verification = new Verification({
                userId: req.userId,
                flatId: flat._id,
                idProofUrl: fileUrl,
                type: "ownership",
                status: "pending"
            });
            await verification.save();
        }

        return res.status(200).json({
            message: "Property registration submitted successfully! Awaiting administrator approval.",
            flat,
            verification
        });
    } catch (error: any) {
        console.log("Error in addProperty landlord Controller.", error);
        return res.status(500).json({ message: error.message });
    }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<any> => {
    const paymentId = req.params.paymentId;
    const status = req.body.status;

    try {
        const payment = await Payment.findOneAndUpdate(
            { paymentId: paymentId },
            { status: status },
            { new: true }
        );

        if (payment && status === "approved") {
            // Activate the pending lease and mark the flat as occupied
            const lease = await Lease.findById(payment.leaseId);
            if (lease) {
                lease.status = "active";
                await lease.save();

                const flat = await Flat.findById(lease.flatId);
                if (flat) {
                    flat.status = "occupied";
                    flat.leaseId = lease._id as any;
                    await flat.save();
                }
            }
        } else if (payment && status === "rejected") {
            // Reject the pending lease — everything goes back to normal
            const lease = await Lease.findById(payment.leaseId);
            if (lease && lease.status === "pending") {
                lease.status = "rejected";
                await lease.save();
                // Flat stays vacant, no changes needed
            }
        }

        return res.status(200).json({ message: "Payment status updated successfully", payment });
    } catch (error) {
        console.log("Error in payment updation", error);
        return res.status(500).json({ message: "Error in payment Updation" });
    }
};

export const uploadDocuments = async (req: Request, res: Response): Promise<any> => {
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
    } catch (error: any) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getProperties = async (req: Request, res: Response): Promise<any> => {
    try {
        const flats = await Flat.find({ ownerId: req.userId }).populate({
            path: "leaseId",
            populate: {
                path: "tenantId",
                select: "firstName lastName email phone"
            }
        });
        return res.status(200).json({ message: "Properties fetched successfully", flats });
    } catch (error: any) {
        console.error("Error in getProperties:", error);
        return res.status(500).json({ message: "Error fetching properties" });
    }
};

export const identityVerification = async (req: Request, res: Response): Promise<any> => {
    const landlordId = req.userId;
    const { flatId } = req.body;
    try {
        const user = await User.findById(landlordId);
        if (!user) {
            return res.status(404).json({ message: "Landlord not found" });
        }

        let fileUrl = "";

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.documentUrl) {
            fileUrl = req.body.documentUrl;
        }

        if (!fileUrl) {
            return res.status(400).json({ message: "Identity proof document is required for verification." });
        }

        // Check if a verification request already exists
        let verification = await Verification.findOne({ userId: landlordId, type: "identity" });

        if (verification) {
            // Push current state to attempts log
            verification.attempts.push({
                idProofUrl: verification.idProofUrl,
                status: verification.status,
                rejectionReason: verification.rejectionReason || "",
                flatId: verification.flatId,
                submittedAt: (verification as any).updatedAt || new Date()
            });

            // Update existing verification request to pending
            verification.idProofUrl = fileUrl;
            verification.flatId = flatId || undefined;
            verification.status = "pending";
            verification.rejectionReason = "";
            await verification.save();
        } else {
            // Create a new verification request
            verification = new Verification({
                userId: landlordId,
                flatId: flatId || undefined,
                idProofUrl: fileUrl,
                type: "identity",
                status: "pending"
            });
            await verification.save();
        }

        // If flatId is provided, update its approval status to pending
        if (flatId) {
            await Flat.findByIdAndUpdate(flatId, { isApproved: "pending" });
        }

        // Make sure user's isVerified is false (or remains false) while request is pending
        user.isVerified = false;
        await user.save();

        return res.status(200).json({
            message: "Identity verification request submitted successfully. Status is now pending administrator approval.",
            verification,
            user
        });
    } catch (error: any) {
        console.error("Error in identityVerification:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await User.findById(req.userId);
        const verification = await Verification.findOne({ userId: req.userId, type: "identity" })
            .sort({ createdAt: -1 })
            .populate("flatId", "flatNo status isApproved");
        return res.status(200).json({ message: "Profile fetched successfully", user, verification });
    } catch (error: any) {
        console.error("Error in getProfile:", error);
        return res.status(500).json({ message: "Error fetching profile" });
    }
};

export const getDashboard = async (req: Request, res: Response): Promise<any> => {
    try {
        const flats = await Flat.find({ ownerId: req.userId });
        const totalProperties = flats.length;
        const occupiedProperties = flats.filter(f => f.status === "occupied").length;

        // Active Tenants matches occupied properties
        const activeTenants = occupiedProperties;

        // Monthly Income
        const monthlyIncome = flats
            .filter(f => f.status === "occupied" && f.monthlyRent)
            .reduce((sum, f) => sum + parseFloat(f.monthlyRent || "0"), 0);

        // Fetch leases for landlord's flats
        const landlordLeases = await Lease.find({ flatId: { $in: flats.map(f => f._id) } });
        const landlordLeaseIds = landlordLeases.map(l => l._id);

        // Fetch payments for these leases
        const payments = await Payment.find({ leaseId: { $in: landlordLeaseIds } });
        const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;

        // Lease requests are initial payments that are still pending
        const pendingLeaseRequests = pendingPaymentsCount;

        return res.status(200).json({
            success: true,
            totalProperties,
            occupiedProperties,
            pendingPayments: pendingPaymentsCount,
            monthlyIncome,
            activeTenants,
            pendingLeaseRequests
        });
    } catch (error: any) {
        console.error("Error in landlord getDashboard:", error);
        return res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
};