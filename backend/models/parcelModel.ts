import mongoose, { Document, Schema } from "mongoose";

export interface IParcel extends Document {
    userId: mongoose.Types.ObjectId;
    flatId?: mongoose.Types.ObjectId;
    platform: "Amazon" | "Flipkart" | "Myntra" | "Meesho" | "Other";
    description: string;
    expectedDate?: Date;
    orderScreenshotUrl?: string;
    status: "Pending" | "ReceivedAtGate" | "Collected";
    gatePhotoUrl?: string;
    receivedAt?: Date;
    collectedAt?: Date;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const parcelSchema = new Schema<IParcel>({
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
    platform: {
        type: String,
        enum: ["Amazon", "Flipkart", "Myntra", "Meesho", "Other"],
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    expectedDate: {
        type: Date,
        required: false
    },
    orderScreenshotUrl: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ["Pending", "ReceivedAtGate", "Collected"],
        default: "Pending"
    },
    gatePhotoUrl: {
        type: String,
        required: false
    },
    receivedAt: {
        type: Date,
        required: false
    },
    collectedAt: {
        type: Date,
        required: false
    },
    adminNote: {
        type: String,
        required: false,
        maxlength: 300
    }
}, { timestamps: true });

export const Parcel = mongoose.model<IParcel>("Parcel", parcelSchema);
