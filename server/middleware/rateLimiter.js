const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for sensitive authentication endpoints (login, register, verify-otp, forgot-password)
 * Prevents automated credential stuffing and email flooding.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication requests from this IP. Please try again after 15 minutes."
    }
});

/**
 * Rate limiter for code execution endpoints
 * Prevents execution quota exhaustion and server overload.
 */
const executeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 25, // Limit each IP to 25 code executions per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Rate limit exceeded. Please wait a moment before running more code."
    }
});

/**
 * General API rate limiter for standard routes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down."
    }
});

module.exports = {
    authLimiter,
    executeLimiter,
    generalLimiter
};
