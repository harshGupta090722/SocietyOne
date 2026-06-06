import mongoose, { Schema } from "mongoose";
const attemptSchema = new Schema({
    idProofUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true },
    rejectionReason: { type: String, default: "" },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: false },
    submittedAt: { type: Date, default: Date.now }
});
const verificationSchema = new Schema({
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
export const Verification = mongoose.model("Verification", verificationSchema);
