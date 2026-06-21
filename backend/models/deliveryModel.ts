import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryRequest extends Document {
    flatId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    platform: "Swiggy" | "Zomato" | "Zepto" | "Blinkit" | "Amazon" | "Flipkart" | "Myntra" | "Meesho" | "Other";
    partnerName: string;
    partnerPhone: string;
    status: "Pending" | "Verified" | "Completed";
    verifiedAt?: Date;
    completedAt?: Date;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const deliveryRequestSchema = new Schema<IDeliveryRequest>({
    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    platform: {
        type: String,
        enum: ["Swiggy", "Zomato", "Zepto", "Blinkit", "Amazon", "Flipkart", "Myntra", "Meesho", "Other"],
        required: true
    },
    partnerName: {
        type: String,
        required: true,
        maxlength: 100
    },
    partnerPhone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    status: {
        type: String,
        enum: ["Pending", "Verified", "Completed"],
        default: "Pending"
    },
    verifiedAt: {
        type: Date,
        required: false
    },
    completedAt: {
        type: Date,
        required: false
    },
    adminNote: {
        type: String,
        required: false,
        maxlength: 300
    }
}, { timestamps: true });

export const DeliveryRequest = mongoose.model<IDeliveryRequest>("DeliveryRequest", deliveryRequestSchema);