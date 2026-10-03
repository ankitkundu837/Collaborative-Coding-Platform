const express = require("express");
const { executeController } = require("../controllers/executeController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { executeLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// POST /api/execute - Run user code securely with rate limiting and authentication
router.post("/", authMiddleware, executeLimiter, executeController);

module.exports = router;