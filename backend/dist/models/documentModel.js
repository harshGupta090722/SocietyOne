import mongoose from "mongoose";
const documentSchema = new mongoose.Schema({
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lease",
        required: true,
        unique: true
    },
    rentAgreement: {
        type: String,
        required: true
    },
    policeVerification: {
        type: String,
        required: true
    }
}, { timestamps: true });
export const Document = mongoose.model("Document", documentSchema);
