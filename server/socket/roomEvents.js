const Y = require("yjs");
const { rooms, disconnectTimers } = require("../store/roomStore");
const { getRoom, persistRoom, ensureRoomYDoc } = require("../services/roomService");
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

function assignColorForUser(room, userId) {
    const sUserId = String(userId);

    // Collect all colors currently held by OTHER active participants in the room
    const usedColors = new Set(
        room.participants
            .filter((p) => String(p.userId) !== sUserId && p.color)
            .map((p) => p.color.toLowerCase())
    );

    // If this participant already has a valid color in this room AND it doesn't collide, keep it!
    const existing = room.participants.find((p) => String(p.userId) === sUserId);
    if (existing && existing.color && !usedColors.has(existing.color.toLowerCase())) {
        return existing.color;
    }

    // Pick the first color from PARTICIPANT_COLORS that is NOT currently used
    for (const color of PARTICIPANT_COLORS) {
        if (!usedColors.has(color.toLowerCase())) {
            return color;
        }
    }

    // If more than 8 participants, pick the color with the minimum count among active users
    const counts = {};
    for (const color of PARTICIPANT_COLORS) {
        counts[color.toLowerCase()] = 0;
    }
    for (const p of room.participants) {
        if (p.color && String(p.userId) !== sUserId) {
            const c = p.color.toLowerCase();
            counts[c] = (counts[c] || 0) + 1;
        }
    }
    let min = Infinity;
    let selectedColor = PARTICIPANT_COLORS[0];
    for (const color of PARTICIPANT_COLORS) {
        const cnt = counts[color.toLowerCase()] || 0;
        if (cnt < min) {
            min = cnt;
            selectedColor = color;
        }
    }
    return selectedColor;
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

        const sUserId = String(socket.user.id);

        // Cancel any pending disconnect timer for this user in this room
        const timerKey = `${cleanRoomId}-${sUserId}`;
        if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey));
            disconnectTimers.delete(timerKey);
        }

        let participant = room.participants.find(
            (p) => String(p.userId) === sUserId
        );

        if (!participant) {
            const color = assignColorForUser(room, sUserId);
            participant = {
                userId: sUserId,
                displayName: getDisplayName(socket.user.email),
                email: socket.user.email,
                socketId: socket.id,
                color,
                joinedAt: new Date(),
                cursor: null
            };
            room.participants.push(participant);
        } else {
            // Participant already in room: preserve their color unless it collides with another participant
            const otherColors = new Set(
                room.participants
                    .filter((p) => String(p.userId) !== sUserId && p.color)
                    .map((p) => p.color.toLowerCase())
            );
            if (!participant.color || otherColors.has(participant.color.toLowerCase())) {
                participant.color = assignColorForUser(room, sUserId);
            }
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

        // Send initial room snapshot to joining user with current terminal state and Yjs state
        const yDoc = ensureRoomYDoc(room);
        const yjsUpdate = Y.encodeStateAsUpdate(yDoc);

        socket.emit("joined-room", {
            roomId: cleanRoomId,
            title: room.title || "Collaborative Session",
            hostId: room.hostId,
            participants: room.participants,
            code: room.code,
            yjsUpdate,
            language: room.language,
            stdin: room.stdin || "",
            output: room.output || "",
            status: room.status || "",
            metrics: room.metrics || null,
            messages: room.messages || [],
            currentUserId: socket.user.id,
            userColor: participant.color
        });

        socket.emit("yjs-init", yjsUpdate);
    });

    // =====================================
    // LEAVE ROOM
    // =====================================
    socket.on("leave-room", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        const room = rooms.get(roomId);
        const sUserId = String(socket.user.id);
        const timerKey = `${roomId}-${sUserId}`;

        if (disconnectTimers.has(timerKey)) {
            clearTimeout(disconnectTimers.get(timerKey));
            disconnectTimers.delete(timerKey);
        }

        room.participants = room.participants.filter(
            (p) => String(p.userId) !== sUserId
        );

        socket.leave(roomId);
        io.to(roomId).emit("user-left", sUserId);
        persistRoom(roomId);
    });

    // =====================================
    // DISCONNECT HANDLING WITH RECOVERY GRACE PERIOD
    // =====================================
    socket.on("disconnect", (reason) => {
        const sUserId = String(socket.user.id);
        for (const [roomId, room] of rooms.entries()) {
            const participant = room.participants.find(
                (p) => String(p.userId) === sUserId
            );

            if (!participant) continue;

            // If the disconnected socket is not the currently active socket for this participant, skip
            if (participant.socketId && participant.socketId !== socket.id) {
                continue;
            }

            const timerKey = `${roomId}-${sUserId}`;
            if (disconnectTimers.has(timerKey)) continue;

            // 60-second grace window to handle network switching, tab throttling, or brief disconnects
            const timer = setTimeout(() => {
                const currentRoom = rooms.get(roomId);
                if (!currentRoom) return;

                const currentParticipant = currentRoom.participants.find(
                    (p) => String(p.userId) === sUserId
                );

                // If user reconnected on a new socket during the grace period, do NOT kick them
                if (currentParticipant && currentParticipant.socketId !== socket.id) {
                    disconnectTimers.delete(timerKey);
                    return;
                }

                currentRoom.participants = currentRoom.participants.filter(
                    (p) => String(p.userId) !== sUserId
                );

                io.to(roomId).emit("user-left", sUserId);
                disconnectTimers.delete(timerKey);
                persistRoom(roomId);
            }, 60000);

            disconnectTimers.set(timerKey, timer);
        }
    });
}

module.exports = registerRoomEvents;