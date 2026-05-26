import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        required: true
    },
    rentAgreement: {
        type: String,
        required: true
    },
    tenantIdProof: {
        type: String,
        required: true
    },
    ownerIdProof: {
        type: String,
        required: true
    },
    policeVerification: {
        type: String,
        required: true
    },
    ownershipProof: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Document = mongoose.model("Document", documentSchema);