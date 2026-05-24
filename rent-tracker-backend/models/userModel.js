import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
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
        minLen: 8
    },
    role: {
        type: String,
        enum: ["tenant", "landlord"],
        default: "tenant"
    },
});

export const User = mongoose.model("User", UserSchema);