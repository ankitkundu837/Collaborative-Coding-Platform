const jwt = require("jsonwebtoken");

/**
 * Socket.IO Authentication Middleware
 * Validates JWT during the WebSocket handshake before allowing socket connection.
 * Sanitizes logs to prevent sensitive credentials or tokens from leaking.
 */
const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication token required for real-time connection"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach authenticated user information to the socket instance
        socket.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        next(new Error("Invalid or expired authentication token"));
    }
};

module.exports = socketAuthMiddleware;