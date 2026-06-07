import jwt from "jsonwebtoken";
import config from "../config/config.js";
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }
        // Correctly split the token by space ' '
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token format is invalid" });
        }
        // Verify the token using the key configured in authController (TENANT_SECRET_KEY)
        const decoded = jwt.verify(token, config.TENANT_SECRET_KEY);
        // Attach userId and userRole to the request object (supported by types.d.ts global extension)
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        console.error("Error in authMiddleware:", error.message);
        return res.status(401).json({ message: "Token is not valid or has expired" });
    }
};
