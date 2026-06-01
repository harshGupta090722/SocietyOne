import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
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
        default: function () {
            return this.role === "admin";
        }
    }
});
export const User = mongoose.model("User", UserSchema);
