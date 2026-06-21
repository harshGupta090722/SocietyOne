import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT, 10),
    secure: parseInt(config.SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    
    // If SMTP credentials aren't properly configured, log the URL to console for local testing
    if (!config.SMTP_USER || !config.SMTP_PASS || config.SMTP_USER === "your-email@gmail.com") {
        console.warn("====================================================");
        console.warn("SMTP credentials not configured. Here is the reset link:");
        console.log(resetUrl);
        console.warn("====================================================");
        return;
    }

    const mailOptions = {
        from: `"SocietyOne" <${config.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request - SocietyOne",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b; text-align: center;">SocietyOne Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your SocietyOne account. Click the button below to reset your password. This link is valid for 15 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #3b82f6;"><a href="${resetUrl}">${resetUrl}</a></p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendDeliveryNoticeEmail = async (
    email: string,
    tenantName: string,
    platform: string,
    partnerName: string,
    partnerPhone: string,
    flatNo: string
): Promise<void> => {
    // If SMTP credentials aren't properly configured, log to console for local testing
    if (!config.SMTP_USER || !config.SMTP_PASS || config.SMTP_USER === "your-email@gmail.com") {
        console.warn("====================================================");
        console.warn("SMTP credentials not configured. Delivery notice:");
        console.log(`To: ${email} | ${platform} delivery by ${partnerName} (${partnerPhone}) heading to flat ${flatNo}`);
        console.warn("====================================================");
        return;
    }

    const mailOptions = {
        from: `"SocietyOne" <${config.SMTP_USER}>`,
        to: email,
        subject: `Delivery Alert - ${platform} delivery arriving at ${flatNo}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b; text-align: center;">🚚 Delivery Incoming!</h2>
                <p>Hello ${tenantName},</p>
                <p>A delivery has been verified by our gatekeeper and is heading towards your home.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Platform</td>
                            <td style="padding: 8px 0; color: #1e293b; font-weight: 700;">${platform}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Delivery Partner</td>
                            <td style="padding: 8px 0; color: #1e293b;">${partnerName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone No.</td>
                            <td style="padding: 8px 0; color: #1e293b;">${partnerPhone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Flat</td>
                            <td style="padding: 8px 0; color: #1e293b;">${flatNo}</td>
                        </tr>
                    </table>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">This is an automated notification from SocietyOne gate management.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};