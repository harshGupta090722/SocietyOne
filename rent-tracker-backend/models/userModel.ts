import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "tenant" | "landlord" | "admin";
    phone: string;
    isVerified: boolean;
}

const UserSchema: Schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ["tenant", "landlord", "admin"],
        default: "tenant"
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: function (): boolean {
            return this.role === "admin";
        }
    }
});

export const User = mongoose.model<IUser>("User", UserSchema);
