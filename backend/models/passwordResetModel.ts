import mongoose, { Document as MongooseDocument, Schema } from "mongoose";

export interface IPasswordReset extends MongooseDocument {
    email: string;
    token: string;
    expiresAt: Date;
}

const passwordResetSchema: Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// TTL Index: This will automatically delete the document when expiresAt is reached
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = mongoose.model<IPasswordReset>("PasswordReset", passwordResetSchema);
