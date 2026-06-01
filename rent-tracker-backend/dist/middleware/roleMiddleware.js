export const adminMiddleware = async (req, res, next) => {
    try {
        // Ensure authMiddleware has run first and populated req.userRole
        if (!req.userRole) {
            return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
        }
        if (req.userRole !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    }
    catch (error) {
        console.error("Error in adminMiddleware:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const landlordMiddleware = async (req, res, next) => {
    try {
        // Ensure authMiddleware has run first and populated req.userRole
        if (!req.userRole) {
            return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
        }
        if (req.userRole !== "landlord") {
            return res.status(403).json({ message: "Access denied. Landlords only." });
        }
        next();
    }
    catch (error) {
        console.error("Error in landlordMiddleware:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const tenantMiddleware = async (req, res, next) => {
    try {
        // Ensure authMiddleware has run first and populated req.userRole
        if (!req.userRole) {
            return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
        }
        if (req.userRole !== "tenant") {
            return res.status(403).json({ message: "Access denied. Tenants only." });
        }
        next();
    }
    catch (error) {
        console.error("Error in tenantMiddleware:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
