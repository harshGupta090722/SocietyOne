import { Lease } from "../models/leaseModel.js";
import { Flat } from "../models/flatModel.js";
import { User } from "../models/userModel.js";

export const createLease = async (req, res) => {
    const { flatId, landlordId, tenantId, monthlyRent, securityDeposit, startDate, endDate } = req.body;

    if (!flatId || !landlordId || !tenantId || !monthlyRent || !securityDeposit || !startDate || !endDate) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // 1. Create and save the lease
        const lease = new Lease({
            flatId,
            tenantId,
            landlordId,
            monthlyRent,
            securityDeposit,
            startDate,
            endDate
        });

        await lease.save();

        // 2. Update Flat to occupied, linking tenant, owner, and lease
        await Flat.findByIdAndUpdate(flatId, {
            status: "occupied",
            TenantId: tenantId,
            LeaseId: lease._id,
            ownerId: landlordId
        });

        // 3. Link the flat to the Tenant user
        await User.findByIdAndUpdate(tenantId, {
            flatId: flatId
        });

        res.status(201).json({ message: "Lease created successfully, flat occupied!", lease });
    } catch (error) {
        console.error("Error in createLease:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getLeaseDetails = async (req, res) => {
    try {
        const { flatId } = req.params;
        
        // Find the flat first, then populate its Lease record
        const flat = await Flat.findById(flatId);
        
        if (!flat) {
            return res.status(404).json({ message: "Flat not found" });
        }

        if (!flat.LeaseId) {
            return res.status(404).json({ message: "No active lease found for this flat" });
        }

        const lease = await Lease.findById(flat.LeaseId);
        res.status(200).json({ lease });
    } catch (error) {
        console.error("Error in getLeaseDetails:", error);
        res.status(500).json({ message: "Server error" });
    }
};