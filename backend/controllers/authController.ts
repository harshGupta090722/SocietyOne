import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto from "crypto";
import { PasswordReset } from "../models/passwordResetModel.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";

export const signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        if (!firstName || !lastName || !email || !password || !role || !phone) {
            return res.status(400).json({ message: "Please fill all the required fields" });
        }

        if (!/^\d{10}$/.test(String(phone))) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (role === "admin") {
            const existingAdmin = await User.findOne({ role: "admin" });
            if (existingAdmin) {
                return res.status(400).json({ message: "An administrator account already exists. Only one admin is allowed." });
            }
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashPassword,
            role,
            phone
        });

        await user.save();

        // Avoid returning password in response
        const userObj = user.toObject() as any;
        delete userObj.password;

        return res.status(201).json({ message: "User created successfully", user: userObj });
    } catch (error: any) {
        console.error("Error in signup controller:", error);
        // Surface Mongoose schema validation errors as a clear 400 message
        if (error?.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0] as any;
            return res.status(400).json({ message: firstError?.message || "Invalid input data." });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Please fill all the required fields" });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Verify if the role requested matches the user's role in the DB
        if (user.role !== role) {
            return res.status(403).json({ message: `Unauthorized. User is not registered as a ${role}.` });
        }

        // Sign the token encoding both the user ID and role
        const token = jwt.sign(
            { id: user._id, role: user.role },
            config.TENANT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        // Avoid returning password in response
        const userObj = user.toObject() as any;
        delete userObj.password;

        return res.status(200).json({
            message: "User logged in successfully",
            user: userObj,
            token
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        // Simple token clearing message (frontend will delete the token from localStorage)
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error in getMe controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user)
            return res.status(404).json({ message: "User not found" })

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await PasswordReset.deleteMany({ email: email.toLowerCase() });

        await PasswordReset.create({
            email: email.toLowerCase(),
            token,
            expiresAt
        });

        await sendResetPasswordEmail(user.email, token);

        return res.status(200).json({
            message: "If that email is registered, we sent a link to reset your password."
        });

    } catch (error) {
        console.error("Error in forgotPassword controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        const resetRecord = await PasswordReset.findOne({ token });

        if (!resetRecord) {
            return res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        if (resetRecord.expiresAt < new Date()) {
            await PasswordReset.deleteOne({ _id: resetRecord._id });
            return res.status(400).json({ message: "Password reset token has expired" });
        }

        const user = await User.findOne({ email: resetRecord.email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        await PasswordReset.deleteOne({ _id: resetRecord._id });

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error in resetPassword controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
