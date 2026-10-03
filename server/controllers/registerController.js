const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../services/emailService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate Input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check Existing User
        const existingUser = await User.findOne({ email: normalizedEmail });

        // Generate SINGLE OTP and hash both password & OTP
        const otp = generateOTP();
        const [hashedPassword, hashedOTP] = await Promise.all([
            bcrypt.hash(password, 10),
            bcrypt.hash(otp, 10)
        ]);

        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        if (existingUser) {
            if (existingUser.verified) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists. Please log in."
                });
            }

            // Update unverified user with fresh credentials
            existingUser.password = hashedPassword;
            existingUser.otp = hashedOTP;
            existingUser.otpExpires = otpExpires;
            existingUser.otpAttempts = 0;
            await existingUser.save();
        } else {
            // Create New User
            await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                verified: false,
                otp: hashedOTP,
                otpExpires,
                otpAttempts: 0
            });
        }

        // Log OTP in server console for instant observability
        console.log(`\n==================================================`);
        console.log(`🔑 REGISTRATION OTP FOR [${normalizedEmail}]: ${otp}`);
        console.log(`==================================================\n`);

        const textContent = `Welcome to CodeSync!\n\nYour 6-digit email verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not sign up for an account, please ignore this email.`;

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
                    <h2 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 18px;">Verify Your Email Address</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
                        Welcome to CodeSync! Enter the 6-digit verification code below to activate your account:
                    </p>
                    <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${otp}</span>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        This code is valid for <strong>10 minutes</strong>.<br>If you did not create an account, you can safely ignore this email.
                    </p>
                </div>
                <div style="padding: 16px 24px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center; font-size: 11px; color: #64748b;">
                    &copy; ${new Date().getFullYear()} CodeSync Collaborative IDE. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;

        // Dispatch Email Synchronously to ensure delivery before completing request
        const emailResult = await sendEmail(
            normalizedEmail,
            "Verify Your SyncForge Account",
            textContent,
            htmlContent
        );

        if (!emailResult.success) {
            if (emailResult.simulated) {
                console.warn(`⚠️ [EMAIL NOTICE] Verification email for ${normalizedEmail} was simulated.`);
            } else {
                console.error(`⚠️ [EMAIL ERROR] Failed to send verification email to ${normalizedEmail}:`, emailResult.error);
            }
        }

        const isProdConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

        return res.status(201).json({
            success: true,
            message: isProdConfigured && emailResult.success
                ? "Registration successful! A verification code has been sent to your email."
                : "Registration successful! Verification code generated.",
            email: normalizedEmail,
            ...(!isProdConfigured || emailResult.simulated ? { devOtp: otp } : {})
        });

    } catch (error) {
        console.error("registerController error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to register user"
        });
    }
};

module.exports = {
    registerController
};