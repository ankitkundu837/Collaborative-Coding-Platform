const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../services/emailService");

const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset link has been sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetToken = hashedToken;
        user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const rawClientUrl = process.env.CLIENT_URL || "https://syncforge-basu3.vercel.app";
        const clientUrl = rawClientUrl.replace(/\/+$/, "");
        const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

        const textContent = `Hello,\n\nYou requested a password reset for your SyncForge account.\n\nPlease click the link below to set a new password:\n\n${resetLink}\n\nThis link is valid for 15 minutes.\n\nIf you did not request this password reset, you can safely ignore this email.`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">&lt;/&gt; SyncForge</h1>
                </div>
                <div style="padding: 28px 24px; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 18px;">Password Reset Request</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0;">
                        You recently requested to reset your password for your SyncForge account. Click the button below to choose a new password:
                    </p>
                    <a href="${resetLink}" style="display: inline-block; background: #6366f1; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(99,102,241,0.4);">Reset Password</a>
                    <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0 0;">
                        This link is valid for <strong>15 minutes</strong>.<br>If you did not request this password reset, you can safely ignore this email.
                    </p>
                </div>
                <div style="padding: 16px 24px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b;">
                    &copy; ${new Date().getFullYear()} SyncForge Collaborative IDE. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;

        const emailResult = await sendEmail(
            normalizedEmail,
            "Password Reset Request — SyncForge",
            textContent,
            htmlContent
        );

        if (!emailResult.success) {
            if (emailResult.simulated) {
                console.warn(`⚠️ [EMAIL NOTICE] Password reset email for ${normalizedEmail} was simulated.`);
            } else {
                console.error(`⚠️ [EMAIL ERROR] Failed to send password reset email to ${normalizedEmail}:`, emailResult.error);
            }
        }

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent."
        });

    } catch (error) {
        console.error("forgotPassword error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process password reset request."
        });
    }
};

module.exports = {
    forgotPasswordController
};