import { Lease } from "../models/leaseModel.js";
import { Payment } from "../models/paymentModel.js";
import { Flat } from "../models/flatModel.js";

export const getFinances = async (req, res) => {
    let totalRent = 0;
    let totalSecurityDeposit = 0;

    try {
        // Since landlordId is not in the Lease model, fetch flats owned by landlord first
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.LeaseId).filter(id => id != null);

        const leases = await Lease.find({ _id: { $in: leaseIds } });

        leases.forEach(lease => {
            totalRent += lease.monthlyRent;
            totalSecurityDeposit += lease.securityDeposit;
        });

        res.status(200).json({ totalRent, totalSecurityDeposit });
    } catch (error) {
        console.error("Error in getFinances:", error);
        res.status(500).json({ message: "Error fetching finances" });
    }
};

export const viewLeases = async (req, res) => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.LeaseId).filter(id => id != null);

        const leases = await Lease.find({ _id: { $in: leaseIds } }).populate("flatId");
        res.status(200).json({ leases });
    } catch (error) {
        console.error("Error in viewLeases:", error);
        res.status(500).json({ message: "Error fetching leases" });
    }
};

export const viewPayments = async (req, res) => {
    try {
        const landlordFlats = await Flat.find({ ownerId: req.userId });
        const leaseIds = landlordFlats.map(f => f.LeaseId).filter(id => id != null);

        const payments = await Payment.find({ leaseId: { $in: leaseIds } }).populate("tenantId");

        res.status(200).json({ payments });
    } catch (error) {
        console.error("Error in viewPayments:", error);
        res.status(500).json({ message: "Error fetching payments" });
    }
};

export const updatePaymentStatus = async (req, res) => {
    const paymentId = req.params.paymentId;
    const status = req.body.status;

    try {
        const payment = await Payment.findOneAndUpdate(
            { paymentId: paymentId },
            { status: status },
            { new: true }
        );

        return res.status(200).json({ message: "Payment status updated successfully", payment });
    } catch (error) {
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

        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};