import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        if (!firstName || !lastName || !email || !password || !role || !phone) {
            return res.status(400).json({ message: "Please fill all the required fields" });
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
    } catch (error) {
        console.error("Error in signup controller:", error);
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
