import mongoose, { Schema } from "mongoose";
const verificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // A user has exactly one verification request
    },
    idProofUrl: {
        type: String,
        required: true
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });
export const Verification = mongoose.model("Verification", verificationSchema);
