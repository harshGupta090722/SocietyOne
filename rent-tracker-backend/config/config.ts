import dotenv from "dotenv";

dotenv.config();

interface Config {
    PORT: string;
    LANDLORD_SECRET_KEY: string;
    TENANT_SECRET_KEY: string;
    ADMIN_SECRET_KEY: string;
    MONGO_URL: string;
}

const config: Config = {
    PORT: process.env.PORT || "3000",
    LANDLORD_SECRET_KEY: process.env.LANDLORD_SECRET_KEY || "",
    TENANT_SECRET_KEY: process.env.TENANT_SECRET_KEY || "",
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "",
    MONGO_URL: process.env.MONGO_URL || "",
};

export default config;