const Y = require("yjs");
const { nanoid } = require("nanoid");
const { Room, DEFAULT_STARTER_CODE } = require("../models/Room");
const { rooms } = require("../store/roomStore");

/**
 * Ensure an in-memory room has an active Y.Doc initialized
 */
function ensureRoomYDoc(room) {
    if (!room) return null;
    if (!room.yDoc) {
        room.yDoc = new Y.Doc();
        const ytext = room.yDoc.getText("monaco");
        if (room.code && ytext.length === 0) {
            ytext.insert(0, room.code);
        }
    }
    return room.yDoc;
}

/**
 * Get or load a room from memory, or fallback to MongoDB
 */
async function getRoom(roomId) {
    if (!roomId) return null;

    // 1. Check in-memory fast store
    if (rooms.has(roomId)) {
        const memRoom = rooms.get(roomId);
        ensureRoomYDoc(memRoom);
        return memRoom;
    }

    // 2. Fallback to MongoDB persistence
    try {
        const dbRoom = await Room.findOne({ roomId });
        if (dbRoom) {
            const memoryRoom = {
                roomId: dbRoom.roomId,
                title: dbRoom.title,
                hostId: dbRoom.hostId.toString(),
                participants: [],
                language: dbRoom.language || "cpp",
                code: dbRoom.code || DEFAULT_STARTER_CODE.cpp,
                messages: [],
                createdAt: dbRoom.createdAt,
                lastActiveAt: new Date()
            };

            ensureRoomYDoc(memoryRoom);
            rooms.set(roomId, memoryRoom);
            return memoryRoom;
        }
    } catch (err) {
        console.error("Error querying room from database:", err);
    }

    return null;
}

/**
 * Create a new room in both MongoDB and memory
 */
async function createRoom({ hostId, title, language = "cpp" }) {
    const roomId = nanoid(10);
    const selectedLanguage = DEFAULT_STARTER_CODE[language] ? language : "cpp";
    const initialCode = DEFAULT_STARTER_CODE[selectedLanguage];

    const dbRoom = await Room.create({
        roomId,
        title: title || "Collaborative Session",
        hostId,
        language: selectedLanguage,
        code: initialCode,
        lastActiveAt: new Date()
    });

    const memoryRoom = {
        roomId,
        title: dbRoom.title,
        hostId: hostId.toString(),
        participants: [],
        language: selectedLanguage,
        code: initialCode,
        messages: [],
        createdAt: new Date(),
        lastActiveAt: new Date()
    };

    ensureRoomYDoc(memoryRoom);
    rooms.set(roomId, memoryRoom);

    return memoryRoom;
}

/**
 * Persist room state (code, language, lastActiveAt) back to MongoDB
 */
async function persistRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    try {
        await Room.findOneAndUpdate(
            { roomId },
            {
                code: room.code,
                language: room.language,
                lastActiveAt: new Date()
            },
            { upsert: false }
        );
    } catch (err) {
        console.error(`Failed to persist room ${roomId} to DB:`, err.message);
    }
}

/**
 * Get recent rooms for a specific user
 */
async function getUserRooms(userId) {
    try {
        const userRooms = await Room.find({ hostId: userId })
            .sort({ lastActiveAt: -1 })
            .limit(10)
            .select("roomId title language createdAt lastActiveAt");
        return userRooms;
    } catch (err) {
        console.error("Error fetching user rooms:", err);
        return [];
    }
}

module.exports = {
    ensureRoomYDoc,
    getRoom,
    createRoom,
    persistRoom,
    getUserRooms
};
