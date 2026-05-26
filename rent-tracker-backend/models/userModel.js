import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
    },
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
        enum: ["tenant", "landlord"],
        default: "tenant"
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true
    }
});

export const User = mongoose.model("User", UserSchema);