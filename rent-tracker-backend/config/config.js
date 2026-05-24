import dotenv from "dotenv";

dotenv.config();

const config = {
    PORT: process.env.PORT,
    LANDLORD_SECRET_KEY: process.env.LANDLORD_SECRET_KEY,
    TENANT_SECRET_KEY: process.env.TENANT_SECRET_KEY,
    MONGO_URL: process.env.MONGO_URL,
}

export default config;