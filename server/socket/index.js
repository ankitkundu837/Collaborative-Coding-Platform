const registerRoomEvents = require("./roomEvents");
const registerEditorEvents = require("./editorEvents");
const registerChatEvents = require("./chatEvents");

function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        // Register modular event listeners for this socket client
        registerRoomEvents(io, socket);
        registerEditorEvents(io, socket);
        registerChatEvents(io, socket);
    });
}

module.exports = registerSocketHandlers;