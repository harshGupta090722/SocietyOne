import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
    paymentId: string;
    leaseId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    amount: number;
    month?: Date;
    paymentDate: Date;
    screenshotURL: string;
    status: "pending" | "approved" | "rejected";
}

const paymentSchema: Schema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: Date,
        required: false
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    screenshotURL: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
