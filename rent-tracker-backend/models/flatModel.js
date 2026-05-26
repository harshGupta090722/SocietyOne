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
    TenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    LeaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        default: null
    },
    status: {
        type: String,
        enum: ["vacant", "occupied"],
        default: "vacant"
    }
});

export const Flat = new mongoose.model("Flat", flatSchema);