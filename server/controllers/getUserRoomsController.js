const { getUserRooms } = require("../services/roomService");

const getUserRoomsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await getUserRooms(userId);

        return res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("getUserRoomsController error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user rooms"
        });
    }
};

module.exports = getUserRoomsController;
