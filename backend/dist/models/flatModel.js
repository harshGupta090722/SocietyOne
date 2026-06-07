import mongoose from "mongoose";
const flatSchema = new mongoose.Schema({
    flatNo: {
        type: String,
        required: true,
        minLength: 4,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        default: null
    },
    monthlyRent: {
        type: String
    },
    securityDeposit: {
        type: String
    },
    status: {
        type: String,
        enum: ["unassigned", "vacant", "occupied"],
        default: "unassigned"
    },
    isApproved: {
        type: String,
        enum: ["approved", "pending", "notApproved"],
        default: "notApproved"
    }
});
export const Flat = mongoose.model("Flat", flatSchema);
