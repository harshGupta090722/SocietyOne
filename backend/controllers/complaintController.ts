import { Request, Response } from "express";
import mongoose from "mongoose";
import { Complaint } from "../models/complaintModel.js";
import { Flat } from "../models/flatModel.js";
import { Lease } from "../models/leaseModel.js";

/**
 * POST /api/v1/complaints
 * Any authenticated user can create a complaint.
 * Body: { targetRole, category, subject, description, flatNo? }
 * Files: images (up to 5 via multer)
 *
 * flatNo-based resolution:
 *  - tenant→tenant: finds the tenant of the occupied flat via active lease
 *  - tenant→landlord: finds the owner of the flat (or auto-resolves from own lease)
 *  - admin→landlord: finds the flat owner by flatNo
 *  - admin→tenant: finds the tenant of the flat via active lease
 */
export const createComplaint = async (req: Request, res: Response): Promise<any> => {
    try {
        const { targetRole, category, subject, description, flatNo, isNotice, priority } = req.body;
        const complainantId = req.userId;
        const complainantRole = req.userRole;

        if (!targetRole || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: "targetRole, subject, and description are required."
            });
        }

        // Collect uploaded image paths
        const images: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                images.push(`/uploads/${file.filename}`);
            }
        }

        let respondentId = null;
        let flatId = null;

        // ── flatNo-based resolution ──
        if (flatNo) {
            const flat = await Flat.findOne({ flatNo: flatNo.trim() });
            if (!flat) {
                return res.status(404).json({
                    success: false,
                    message: `Flat "${flatNo}" not found in the system.`
                });
            }

            flatId = flat._id;

            // Target is TENANT → find the tenant via active lease on that flat
            if (targetRole === "tenant") {
                if (flat.status !== "occupied") {
                    return res.status(400).json({
                        success: false,
                        message: `Flat "${flatNo}" is not occupied. Cannot send complaint to a tenant.`
                    });
                }
                const activeLease = await Lease.findOne({ flatId: flat._id, status: "active" });
                if (!activeLease) {
                    return res.status(400).json({
                        success: false,
                        message: `No active tenant found for flat "${flatNo}".`
                    });
                }
                // Prevent sending complaint to yourself
                if (activeLease.tenantId.toString() === complainantId) {
                    return res.status(400).json({
                        success: false,
                        message: "You cannot send a complaint to yourself."
                    });
                }
                respondentId = activeLease.tenantId;
            }

            // Target is LANDLORD → find the owner of that flat
            if (targetRole === "landlord") {
                if (!flat.ownerId) {
                    return res.status(400).json({
                        success: false,
                        message: `Flat "${flatNo}" does not have an owner assigned.`
                    });
                }
                if (flat.ownerId.toString() === complainantId) {
                    return res.status(400).json({
                        success: false,
                        message: "You cannot send a complaint to yourself."
                    });
                }
                respondentId = flat.ownerId;
            }
        }

        // ── Auto-resolve: tenant→landlord without flatNo (use own active lease) ──
        if (!respondentId && complainantRole === "tenant" && targetRole === "landlord") {
            const activeLease = await Lease.findOne({ tenantId: complainantId, status: "active" });
            if (activeLease) {
                respondentId = activeLease.landlordId;
                flatId = activeLease.flatId;
            }
        }

        // ── Validation: Admin MUST provide flatNo when sending to landlord/tenant IF NOT A NOTICE ──
        if (!isNotice && complainantRole === "admin" && (targetRole === "landlord" || targetRole === "tenant") && !flatNo) {
            return res.status(400).json({
                success: false,
                message: "Admin must specify a flat number when sending a complaint."
            });
        }

        // ── Validation: tenant→tenant MUST provide flatNo ──
        if (complainantRole === "tenant" && targetRole === "tenant" && !flatNo) {
            return res.status(400).json({
                success: false,
                message: "You must specify the flat number of the tenant you want to complain about."
            });
        }

        const complaint = new Complaint({
            complainantId,
            respondentId,
            targetRole,
            category: category || "other",
            subject,
            description,
            images,
            flatId: flatId || null,
            status: "open",
            isNotice: isNotice || false,
            priority: isNotice ? (priority || "moderate") : "moderate"
        });

        await complaint.save();

        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully.",
            data: complaint
        });
    } catch (error: any) {
        console.error("Error in createComplaint:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * GET /api/v1/complaints/sent?status=open|in_progress|resolved
 * Returns complaints filed BY the logged-in user.
 */
export const getMyComplaints = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const filter: any = { complainantId: userId };
        if (status && ["open", "in_progress", "resolved"].includes(status as string)) {
            filter.status = status;
        }

        const complaints = await Complaint.find(filter)
            .populate("complainantId", "firstName lastName email role")
            .populate("respondentId", "firstName lastName email role")
            .populate("flatId", "flatNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: complaints });
    } catch (error: any) {
        console.error("Error in getMyComplaints:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * GET /api/v1/complaints/received?status=open|in_progress|resolved
 * Returns complaints sent TO the logged-in user.
 * - For admin: all complaints where targetRole = "admin"
 * - For landlord/tenant: where respondentId matches OR targetRole matches their role
 */
export const getReceivedComplaints = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { status } = req.query;

        let filter: any;

        if (userRole === "admin") {
            // Admins see all complaints targeted at admins
            filter = { targetRole: "admin", isNotice: { $ne: true } };
        } else {
            // Landlords/tenants see complaints specifically addressed to them
            // OR general complaints to their role
            filter = {
                isNotice: { $ne: true },
                $or: [
                    { respondentId: userId },
                    { targetRole: userRole as any, respondentId: null }
                ]
            };
        }

        if (status && ["open", "in_progress", "resolved"].includes(status as string)) {
            filter.status = status;
        }

        const complaints = await Complaint.find(filter)
            .populate("complainantId", "firstName lastName email role")
            .populate("respondentId", "firstName lastName email role")
            .populate("flatId", "flatNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: complaints });
    } catch (error: any) {
        console.error("Error in getReceivedComplaints:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * GET /api/v1/complaints/notifications
 * Returns complaints/notices sent FROM admin TO the logged-in user.
 * Only for non-admin users (tenant/landlord).
 */
export const getNotifications = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        if (userRole === "admin") {
            return res.status(400).json({
                success: false,
                message: "Admin does not receive notifications from this endpoint."
            });
        }

        const filter = {
            isNotice: true,
            $or: [
                { respondentId: userId },
                { targetRole: userRole as any, respondentId: null }
            ]
        };

        const notifications = await Complaint.find(filter)
            .populate("complainantId", "firstName lastName email role")
            .populate("flatId", "flatNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        console.error("Error in getNotifications:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * PATCH /api/v1/complaints/:id/status
 * Body: { status: "in_progress" | "resolved", resolutionNote? }
 * Only the recipient (or admin for admin-targeted) can update status.
 */
export const updateComplaintStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { status, resolutionNote } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        if (!status || !["in_progress", "resolved"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status (in_progress or resolved) is required."
            });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found." });
        }

        // Authorization: only the target can update
        const isAdmin = userRole === "admin" && complaint.targetRole === "admin";
        const isDirectRecipient = complaint.respondentId?.toString() === userId;
        const isRoleTarget = complaint.targetRole === userRole && !complaint.respondentId;

        if (!isAdmin && !isDirectRecipient && !isRoleTarget) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this complaint."
            });
        }

        complaint.status = status;
        if (status === "resolved") {
            complaint.resolvedAt = new Date();
        }
        if (resolutionNote) {
            complaint.resolutionNote = resolutionNote;
        }

        // If respondentId was null (general complaint), assign it to the person resolving it
        if (!complaint.respondentId) {
            complaint.respondentId = new mongoose.Types.ObjectId(userId!);
        }

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: `Complaint status updated to ${status}.`,
            data: complaint
        });
    } catch (error: any) {
        console.error("Error in updateComplaintStatus:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};