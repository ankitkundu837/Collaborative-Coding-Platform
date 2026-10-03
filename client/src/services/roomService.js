import api from "./api";

export async function createRoom(roomData = {}) {
    const response = await api.post("/rooms/create", roomData);
    return response.data;
}

export async function joinRoom(roomId) {
    const response = await api.post("/rooms/join", { roomId });
    return response.data;
}

export async function getMyRooms() {
    const response = await api.get("/rooms/my-rooms");
    return response.data?.rooms || [];
}