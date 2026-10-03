const bcrypt = require("bcrypt");
const User = require("../models/User");

const MAX_OTP_ATTEMPTS = 5;

const verifyOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "User is already verified. Please login."
            });
        }

        // Check if user has an active OTP
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({
                success: false,
                message: "No OTP was requested or OTP has been invalidated. Please register again or request a new OTP."
            });
        }

        // Check max attempts
        if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();

            return res.status(429).json({
                success: false,
                message: "Too many failed attempts. Your OTP has been invalidated. Please request a new one."
            });
        }

        // Check expiration
        if (Date.now() > user.otpExpires.getTime()) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new verification OTP."
            });
        }

        // Verify OTP hash
        const isMatch = await bcrypt.compare(otp.toString().trim(), user.otp);

        if (!isMatch) {
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            const remainingAttempts = MAX_OTP_ATTEMPTS - user.otpAttempts;

            if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
                user.otp = undefined;
                user.otpExpires = undefined;
                user.otpAttempts = 0;
            }

            await user.save();

            return res.status(400).json({
                success: false,
                message: remainingAttempts > 0
                    ? `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
                    : "Invalid OTP. Maximum attempts reached. Please request a new OTP."
            });
        }

        // Verification successful
        user.verified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in."
        });

    } catch (error) {
        console.error("verifyOTP error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred during verification."
        });
    }
};

module.exports = {
    verifyOTPController
};