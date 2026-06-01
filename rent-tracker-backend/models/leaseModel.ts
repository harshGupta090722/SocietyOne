import mongoose, { Document, Schema } from "mongoose";

export interface ILease extends Document {
    flatId: mongoose.Types.ObjectId;
    landlordId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    monthlyRent: number;
    securityDeposit: number;
    startDate: Date;
    endDate: Date;
    status: "active" | "terminated" | "expired";
}

const leaseSchema: Schema = new mongoose.Schema({
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

export const Lease = mongoose.model<ILease>("Lease", leaseSchema);
