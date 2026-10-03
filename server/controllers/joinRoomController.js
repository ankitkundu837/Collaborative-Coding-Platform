const { getRoom } = require("../services/roomService");

const joinRoomController = async (req, res) => {
    try {
        const { roomId } = req.body;

        if (!roomId || typeof roomId !== "string") {
            return res.status(400).json({
                success: false,
                message: "A valid Room ID is required"
            });
        }

        const cleanRoomId = roomId.trim();
        const room = await getRoom(cleanRoomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found. Please verify the Room ID or create a new room."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room found and accessible",
            roomId: room.roomId,
            title: room.title,
            language: room.language
        });

    } catch (error) {
        console.error("joinRoomController error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while joining room"
        });
    }
};

module.exports = joinRoomController;