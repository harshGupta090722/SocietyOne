import mongoose, { Document as MongooseDocument, Schema } from "mongoose";

export interface IDocument extends MongooseDocument {
    leaseId: mongoose.Types.ObjectId;
    rentAgreement: string;
    policeVerification: string;
}

const documentSchema: Schema = new mongoose.Schema({
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

export const Document = mongoose.model<IDocument>("Document", documentSchema);
