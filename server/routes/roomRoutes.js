const express = require("express");
const createRoomController = require("../controllers/createRoomController");
const joinRoomController = require("../controllers/joinRoomController");
const getUserRoomsController = require("../controllers/getUserRoomsController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Room Routes
router.post("/create", authMiddleware, createRoomController);
router.post("/join", authMiddleware, joinRoomController);
router.get("/my-rooms", authMiddleware, getUserRoomsController);

module.exports = router;