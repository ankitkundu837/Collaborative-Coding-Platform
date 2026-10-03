const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../services/emailService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resendOTPController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please register first."
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified. Please sign in."
            });
        }

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = hashedOTP;
        user.otpExpires = otpExpires;
        user.otpAttempts = 0;
        await user.save();

        console.log(`\n==================================================`);
        console.log(`🔑 RESENT OTP FOR [${normalizedEmail}]: ${otp}`);
        console.log(`==================================================\n`);

        const textContent = `Welcome to CodeSync!\n\nYour new 6-digit email verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this code, please ignore this email.`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">&lt;/&gt; CodeSync</h1>
                </div>
                <div style="padding: 28px 24px; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 18px;">Your New Verification Code</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                        Here is your requested 6-digit verification code to activate your account:
                    </p>
                    <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        This code is valid for <strong>10 minutes</strong>.
                    </p>
                </div>
                <div style="padding: 16px 24px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b;">
                    &copy; ${new Date().getFullYear()} CodeSync Collaborative IDE. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;

        const emailResult = await sendEmail(
            normalizedEmail,
            "Your SyncForge Verification Code",
            textContent,
            htmlContent
        );

        if (!emailResult.success) {
            if (emailResult.simulated) {
                console.warn(`⚠️ [EMAIL NOTICE] Resent verification email for ${normalizedEmail} was simulated.`);
            } else {
                console.error(`⚠️ [EMAIL ERROR] Failed to resend verification email to ${normalizedEmail}:`, emailResult.error);
            }
        }

        const isProdConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

        return res.status(200).json({
            success: true,
            message: isProdConfigured && emailResult.success
                ? "A new verification code has been dispatched to your email."
                : "A new verification code has been generated.",
            ...(!isProdConfigured || emailResult.simulated ? { devOtp: otp } : {})
        });

    } catch (error) {
        console.error("resendOTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to resend verification code. Please try again."
        });
    }
};

module.exports = {
    resendOTPController
};
