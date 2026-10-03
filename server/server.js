require("dotenv").config();

const dns = require("dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const executeRoutes = require("./routes/executeRoutes");

const socketAuthMiddleware = require("./middleware/socketAuthMiddleware");
const registerSocketHandlers = require("./socket");
const { generalLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// Enable trust proxy for correct client IP detection behind Render, Vercel, Nginx, or Cloudflare
app.set("trust proxy", 1);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Security Headers & CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow all requests if CLIENT_URL is '*' or during server-to-server calls
        if (!origin || clientUrl === "*" || origin === clientUrl) {
            return callback(null, true);
        }
        if (
            origin === "http://localhost:5173" ||
            origin === "http://127.0.0.1:5173" ||
            origin.endsWith(".vercel.app") ||
            origin.endsWith(".onrender.com")
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 2. Socket.IO Configuration with resilient ping/pong settings for background tabs
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000
});

// Socket Authentication
io.use(socketAuthMiddleware);

// Register Socket.IO Handlers
registerSocketHandlers(io);

// 3. Application Health Check & Root Endpoints
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CodeSync Collaborative API is live and healthy."
    });
});

// Support both /api/health and Render's default /healthz
app.get(["/api/health", "/healthz"], (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    const isEmailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "HEALTHY" : "DEGRADED",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: isDbConnected ? "Connected" : "Disconnected",
        emailConfigured: isEmailConfigured,
        emailSender: isEmailConfigured ? process.env.EMAIL_USER.trim() : "NOT_CONFIGURED",
        activeSocketConnections: io.engine.clientsCount
    });
});

// 4. API Routes (with general rate limiting)
app.use("/api/", generalLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executeRoutes);

// 5. Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// 6. Server Initialization & Graceful Shutdown
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 CodeSync Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

// Graceful Shutdown
const handleGracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
        console.log("🔒 HTTP server closed.");
        try {
            await mongoose.connection.close(false);
            console.log("💾 MongoDB connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error closing MongoDB connection:", err);
            process.exit(1);
        }
    });
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

startServer();