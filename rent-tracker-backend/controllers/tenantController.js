import { User } from "../models/userModel.js";
import { Flat } from "../models/flatModel.js";
import { Payment } from "../models/paymentModel.js";
import { Lease } from "../models/leaseModel.js";
import { Document } from "../models/documentModel.js";

export const getDashboard = async (req, res) => {
    try {
        // Fetch tenant using req.userId set by authMiddleware
        const tenant = await User.findById(req.userId);
        
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const tenantName = `${tenant.firstName} ${tenant.lastName}`;

        if (!tenant.flatId) {
            return res.status(200).json({
                success: true,
                message: "No flat assigned currently",
                tenantName,
                flatAssigned: false
            });
        }

        const flat = await Flat.findById(tenant.flatId);
        if (!flat) {
            return res.status(404).json({ success: false, message: "Assigned flat not found in database" });
        }

        const flatNo = flat.flatNo;
        const status = flat.status;

        let leaseDetails = null;
        let documentDetails = null;
        let payments = [];
        let outstandingDue = 0;

        if (flat.LeaseId) {
            leaseDetails = await Lease.findById(flat.LeaseId);
            documentDetails = await Document.findOne({ leaseId: flat.LeaseId });
            payments = await Payment.find({ leaseId: flat.LeaseId }).sort({ paymentDate: -1 });

            if (leaseDetails) {
                // Auto-calculate outstanding rent dues dynamically
                const start = new Date(leaseDetails.startDate);
                const now = new Date();
                const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
                
                const totalExpectedRent = Math.max(0, months * leaseDetails.monthlyRent);
                const totalPaidApproved = payments
                    .filter(p => p.status === "approved")
                    .reduce((sum, p) => sum + p.amount, 0);

                outstandingDue = totalExpectedRent - totalPaidApproved;
            }
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
    } catch (error) {
        console.error("Error in getDashboard TenantController:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const makePayment = async (req, res) => {
    try {
        const tenant = await User.findById(req.userId);
        if (!tenant || !tenant.flatId) {
            return res.status(400).json({ 
                success: false, 
                message: "No active flat assigned. Please contact the landlord." 
            });
        }

        const flat = await Flat.findById(tenant.flatId);
        if (!flat || !flat.LeaseId) {
            return res.status(400).json({ 
                success: false, 
                message: "No active lease found. Please contact the landlord." 
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
            leaseId: flat.LeaseId,
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
    } catch (error) {
        console.error("Error in makePayment TenantController:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const viewPayments = async (req, res) => {
    try {
        const tenant = await User.findById(req.userId);

        if (!tenant || !tenant.flatId) {
            return res.status(200).json({ success: true, data: [] });
        }

        const flat = await Flat.findById(tenant.flatId);
        if (!flat || !flat.LeaseId) {
            return res.status(200).json({ success: true, data: [] });
        }

        const payments = await Payment.find({ leaseId: flat.LeaseId }).sort({ paymentDate: -1 });

        return res.status(200).json({ success: true, data: payments });
    } catch (error) {
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

        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};