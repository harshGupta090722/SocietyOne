import mongoose, { Document, Schema } from "mongoose";

export interface IAttempt {
    idProofUrl: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
    flatId?: mongoose.Types.ObjectId;
    submittedAt: Date;
}

export interface IVerification extends Document {
    userId: mongoose.Types.ObjectId;                  // Submitting Tenant or Landlord
    flatId?: mongoose.Types.ObjectId;                 // Claimed property Flat (if landlord)
    idProofUrl: string;                               // Path to uploaded Aadhaar/Passport or Ownership doc
    status: "pending" | "approved" | "rejected";
    type: "identity" | "ownership";                   // Type of verification
    rejectionReason?: string;                         // Populated if rejected by admin
    attempts: IAttempt[];                             // Previous attempts history log
    createdAt: Date;
    updatedAt: Date;
}

const attemptSchema = new Schema<IAttempt>({
    idProofUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true },
    rejectionReason: { type: String, default: "" },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: false },
    submittedAt: { type: Date, default: Date.now }
});

const verificationSchema = new Schema<IVerification>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
        required: false
    },
    idProofUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["identity", "ownership"],
        default: "identity"
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    attempts: {
        type: [attemptSchema],
        default: []
    }
}, { timestamps: true });

export const Verification = mongoose.model<IVerification>("Verification", verificationSchema);