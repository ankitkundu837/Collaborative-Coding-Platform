const express = require("express");
const { registerController } = require("../controllers/registerController");
const { verifyOTPController } = require("../controllers/verifyOTPController");
const { resendOTPController } = require("../controllers/resendOTPController");
const { loginController } = require("../controllers/loginController");
const { forgotPasswordController } = require("../controllers/forgotPasswordController");
const { resetPasswordController } = require("../controllers/resetPasswordController");
const { changePasswordController } = require("../controllers/changePasswordController");
const { meController } = require("../controllers/meController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Public Authentication Endpoints (Rate Limited)
router.post("/register", authLimiter, registerController);
router.post("/verify-otp", authLimiter, verifyOTPController);
router.post("/resend-otp", authLimiter, resendOTPController);
router.post("/login", authLimiter, loginController);
router.post("/forget-password", authLimiter, forgotPasswordController);
router.post("/reset-password", authLimiter, resetPasswordController);

// Authenticated Endpoints
router.get("/me", authMiddleware, meController);
router.post("/change-password", authMiddleware, changePasswordController);

// Admin-only Route
router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome Admin! Authorized access granted."
    });
});

module.exports = router;