import mongoose, { Document, Schema } from "mongoose";

export interface IFlat extends Document {
    flatNo: string;
    ownerId?: mongoose.Types.ObjectId | null;
    leaseId?: mongoose.Types.ObjectId | null;
    monthlyRent?: string;
    securityDeposit?: string;
    status: "unassigned" | "vacant" | "occupied";
    isApproved: "approved" | "pending" | "notApproved";
}

const flatSchema: Schema = new mongoose.Schema({
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

export const Flat = mongoose.model<IFlat>("Flat", flatSchema);