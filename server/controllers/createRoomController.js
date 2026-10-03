const { createRoom } = require("../services/roomService");

const createRoomController = async (req, res) => {
    try {
        const { title, language } = req.body || {};
        const hostId = req.user.id;

        const room = await createRoom({
            hostId,
            title,
            language
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            roomId: room.roomId,
            title: room.title,
            language: room.language
        });
    } catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create room"
        });
    }
};

module.exports = createRoomController;