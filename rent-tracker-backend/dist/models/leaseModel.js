import mongoose from "mongoose";
const leaseSchema = new mongoose.Schema({
    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
        required: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    monthlyRent: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "terminated", "expired"],
        default: "active"
    }
}, { timestamps: true });
export const Lease = mongoose.model("Lease", leaseSchema);
