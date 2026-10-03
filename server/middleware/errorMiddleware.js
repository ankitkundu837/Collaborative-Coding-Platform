/**
 * 404 Not Found handler for undefined API routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Centralized Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled Application Error:", err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
