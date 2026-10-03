import { io } from "socket.io-client";
import { getToken } from "../utils/auth";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000,
    auth: (cb) => {
        // Dynamically fetch latest token from localStorage on every connection attempt
        cb({
            token: getToken()
        });
    }
});

/**
 * Connect socket with fresh token
 */
export function connectSocket(token) {
    const currentToken = token || getToken();
    socket.auth = {
        token: currentToken
    };
    if (!socket.connected) {
        socket.connect();
    }
}

/**
 * Disconnect socket cleanly
 */
export function disconnectSocket() {
    if (socket.connected) {
        socket.disconnect();
    }
}

export default socket;