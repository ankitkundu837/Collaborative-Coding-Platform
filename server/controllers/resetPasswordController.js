const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const resetPasswordController = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Hash the incoming plaintext reset token to match the SHA-256 hash in DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(token.trim())
            .digest("hex");

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset link. Please request a new one."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully! You can now log in with your new password."
        });

    } catch (error) {
        console.error("resetPasswordController error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password. Please try again."
        });
    }
};

module.exports = {
    resetPasswordController
};