const { rooms } = require("../store/roomStore");
const getDisplayName = require("../utils/displayName");

const MAX_CHAT_HISTORY = 100;
const MAX_MESSAGE_LENGTH = 1000;

function registerChatEvents(io, socket) {
    // =====================================
    // SEND CHAT MESSAGE
    // =====================================
    socket.on("send-message", ({ roomId, message }) => {
        if (!roomId || !rooms.has(roomId)) return;

        if (
            typeof message !== "string" ||
            !message.trim() ||
            message.length > MAX_MESSAGE_LENGTH
        ) {
            return;
        }

        const room = rooms.get(roomId);

        if (!room.messages) {
            room.messages = [];
        }

        const participant = room.participants.find(
            (p) => p.userId === socket.user.id
        );

        const chatMessage = {
            id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email),
            color: participant?.color || "#3b82f6",
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        room.messages.push(chatMessage);

        // Keep rolling buffer of recent messages
        if (room.messages.length > MAX_CHAT_HISTORY) {
            room.messages.shift();
        }

        // Broadcast to all participants in the room
        io.to(roomId).emit("chat-message", chatMessage);
    });

    // =====================================
    // CHAT-SPECIFIC TYPING INDICATORS
    // =====================================
    socket.on("chat-typing-start", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        socket.to(roomId).emit("chat-user-typing", {
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });

    socket.on("chat-typing-stop", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        socket.to(roomId).emit("chat-user-stopped-typing", {
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });
}

module.exports = registerChatEvents;
