import api from "./api";
import { removeToken, removeUser } from "../utils/auth";
import { disconnectSocket } from "../socket/socket";

export async function register(formData) {
    const response = await api.post("/auth/register", formData);
    return response.data;
}

export async function verifyOTP(formData) {
    const response = await api.post("/auth/verify-otp", formData);
    return response.data;
}

export async function resendOTP(formData) {
    const response = await api.post("/auth/resend-otp", formData);
    return response.data;
}

export async function login(formData) {
    const response = await api.post("/auth/login", formData);
    return response.data;
}

export async function forgotPassword(formData) {
    const response = await api.post("/auth/forget-password", formData);
    return response.data;
}

export async function resetPassword(formData) {
    const response = await api.post("/auth/reset-password", formData);
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data?.user;
}

export async function changePassword(formData) {
    const response = await api.post("/auth/change-password", formData);
    return response.data;
}

export function logout() {
    removeToken();
    removeUser();
    disconnectSocket();
}