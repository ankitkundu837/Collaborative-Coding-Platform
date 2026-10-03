const { rooms } = require("../store/roomStore");
const { persistRoom } = require("../services/roomService");
const getDisplayName = require("../utils/displayName");

// Debounce timer map for database persistence
const persistDebounceTimers = new Map();

function registerEditorEvents(io, socket) {
    // =====================================
    // CODE SYNCHRONIZATION
    // =====================================
    socket.on("code-change", ({ roomId, code }) => {
        if (!roomId || !rooms.has(roomId) || typeof code !== "string") return;

        const room = rooms.get(roomId);
        room.code = code;
        room.lastActiveAt = new Date();

        // Broadcast to other participants in room
        socket.to(roomId).emit("code-update", code);

        // Debounced DB persistence (save 3 seconds after last keystroke)
        if (persistDebounceTimers.has(roomId)) {
            clearTimeout(persistDebounceTimers.get(roomId));
        }

        const timer = setTimeout(() => {
            persistRoom(roomId);
            persistDebounceTimers.delete(roomId);
        }, 3000);

        persistDebounceTimers.set(roomId, timer);
    });

    // =====================================
    // STDIN SYNCHRONIZATION
    // =====================================
    socket.on("stdin-change", ({ roomId, stdin }) => {
        if (!roomId || !rooms.has(roomId) || typeof stdin !== "string") return;

        const room = rooms.get(roomId);
        room.stdin = stdin;

        // Broadcast updated stdin to peers in the room
        socket.to(roomId).emit("stdin-update", stdin);
    });

    // =====================================
    // CODE EXECUTION LIFECYCLE SYNCHRONIZATION
    // =====================================
    socket.on("execution-start", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        const room = rooms.get(roomId);
        room.status = "RUNNING";
        room.output = "";

        // Notify everyone that execution has started
        socket.to(roomId).emit("execution-started", {
            startedBy: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });

    socket.on("execution-result", ({ roomId, output, status, metrics }) => {
        if (!roomId || !rooms.has(roomId)) return;

        const room = rooms.get(roomId);
        room.output = output;
        room.status = status;
        room.metrics = metrics;

        // Broadcast terminal result to all peers in the room
        socket.to(roomId).emit("terminal-update", {
            output,
            status,
            metrics,
            ranBy: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });

    // =====================================
    // LANGUAGE SYNCHRONIZATION
    // =====================================
    socket.on("language-change", ({ roomId, language }) => {
        if (!roomId || !rooms.has(roomId) || !language) return;

        const room = rooms.get(roomId);
        room.language = language;
        room.lastActiveAt = new Date();

        socket.to(roomId).emit("language-update", { language });
        persistRoom(roomId);
    });

    // =====================================
    // REMOTE CURSOR TRACKING
    // =====================================
    socket.on("cursor-change", ({ roomId, lineNumber, column, selection }) => {
        if (!roomId || !rooms.has(roomId)) return;

        const room = rooms.get(roomId);
        const participant = room.participants.find(
            (p) => p.userId === socket.user.id
        );

        socket.to(roomId).emit("cursor-update", {
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email),
            color: participant?.color || "#3b82f6",
            lineNumber,
            column,
            selection: selection || null
        });
    });

    // =====================================
    // TYPING INDICATORS (EDITOR ONLY)
    // =====================================
    socket.on("typing-start", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        socket.to(roomId).emit("participant-typing", {
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });

    socket.on("typing-stop", ({ roomId }) => {
        if (!roomId || !rooms.has(roomId)) return;

        socket.to(roomId).emit("participant-stopped-typing", {
            userId: socket.user.id,
            displayName: getDisplayName(socket.user.email)
        });
    });
}

module.exports = registerEditorEvents;
