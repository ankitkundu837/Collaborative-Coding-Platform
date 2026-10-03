const { rooms, disconnectTimers } = require("../store/roomStore");
const { getRoom, persistRoom } = require("../services/roomService");
const getDisplayName = require("../utils/displayName");

const PARTICIPANT_COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#14b8a6"  // Teal
];

function getParticipantColor(index) {
    return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

function registerRoomEvents(io, socket) {
    // =====================================
    // JOIN ROOM
    // =====================================
    socket.on("join-room", async (roomId) => {
        if (!roomId || typeof roomId !== "string") {
            socket.emit("room-error", { message: "Invalid Room ID" });
            return;
        }

        const cleanRoomId = roomId.trim();
        const room = await getRoom(cleanRoomId);

        if (!room) {
            socket.emit("room-error", { message: "Room not found" });
            return;
        }

        // Cancel any pending disconnect timer for this user in this room
        const timerKey = `${cleanRoomId}-${socket.user.id}`;
        if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey));
            disconnectTimers.delete(timerKey);
        }

        let participant = room.participants.find(
            (p) => p.userId === socket.user.id
        );

        if (!participant) {
            const color = getParticipantColor(room.participants.length);
            participant = {
                userId: socket.user.id,
                displayName: getDisplayName(socket.user.email),
                email: socket.user.email,
                socketId: socket.id,
                color,
                joinedAt: new Date()
            };
            room.participants.push(participant);
        } else {
            participant.socketId = socket.id;
            participant.email = socket.user.email;
            participant.displayName = getDisplayName(socket.user.email);
        }

        // Leave any prior rooms on this socket except private socket ID room
        for (const joinedRoom of socket.rooms) {
            if (joinedRoom !== socket.id && joinedRoom !== cleanRoomId) {
                socket.leave(joinedRoom);
            }
        }

        socket.join(cleanRoomId);

        // Notify other participants in the room
        socket.to(cleanRoomId).emit("user-joined", participant);

        // Send initial room snapshot to joining user with current terminal state
        socket.emit("joined-room", {
            roomId: cleanRoomId,
            title: room.title || "Collaborative Session",
            hostId: room.hostId,
            participants: room.participants,
            code: room.code,
            language: room.language,
            stdin: room.stdin || "",
            output: room.output || "",
            status: room.status || "",
            metrics: room.metrics || null,
            messages: room.messages || [],
            currentUserId: socket.user.id,
            userColor: participant.color
        });
    });

    // =====================================
    // LEAVE ROOM
    // =====================================
    socket.on("leave-room", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        const room = rooms.get(roomId);
        const timerKey = `${roomId}-${socket.user.id}`;

        if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey));
            disconnectTimers.delete(timerKey);
        }

        room.participants = room.participants.filter(
            (p) => p.userId !== socket.user.id
        );

        socket.leave(roomId);
        io.to(roomId).emit("user-left", socket.user.id);
        persistRoom(roomId);
    });

    // =====================================
    // DISCONNECT HANDLING WITH RECOVERY GRACE PERIOD
    // =====================================
    socket.on("disconnect", (reason) => {
        for (const [roomId, room] of rooms.entries()) {
            const participant = room.participants.find(
                (p) => p.userId === socket.user.id
            );

            if (!participant) continue;

            // If the disconnected socket is not the currently active socket for this participant, skip
            if (participant.socketId && participant.socketId !== socket.id) {
                continue;
            }

            const timerKey = `${roomId}-${socket.user.id}`;
            if (disconnectTimers.has(timerKey)) continue;

            // 60-second grace window to handle network switching, tab throttling, or brief disconnects
            const timer = setTimeout(() => {
                const currentRoom = rooms.get(roomId);
                if (!currentRoom) return;

                const currentParticipant = currentRoom.participants.find(
                    (p) => p.userId === socket.user.id
                );

                // If user reconnected on a new socket during the grace period, do NOT kick them
                if (currentParticipant && currentParticipant.socketId !== socket.id) {
                    disconnectTimers.delete(timerKey);
                    return;
                }

                currentRoom.participants = currentRoom.participants.filter(
                    (p) => p.userId !== socket.user.id
                );

                io.to(roomId).emit("user-left", socket.user.id);
                disconnectTimers.delete(timerKey);
                persistRoom(roomId);
            }, 60000);

            disconnectTimers.set(timerKey, timer);
        }
    });
}

module.exports = registerRoomEvents;