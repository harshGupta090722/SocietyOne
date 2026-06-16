import dotenv from "dotenv";

dotenv.config();

interface Config {
    PORT: string;
    LANDLORD_SECRET_KEY: string;
    TENANT_SECRET_KEY: string;
    ADMIN_SECRET_KEY: string;
    MONGO_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    FRONTEND_URL: string;
}

const config: Config = {
    PORT: process.env.PORT || "3000",
    LANDLORD_SECRET_KEY: process.env.LANDLORD_SECRET_KEY || "",
    TENANT_SECRET_KEY: process.env.TENANT_SECRET_KEY || "",
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "",
    MONGO_URL: process.env.MONGO_URL || "",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.SMTP_PORT || "587",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default config;