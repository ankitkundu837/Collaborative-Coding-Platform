import axios from "axios";
import { getToken, removeToken, removeUser } from "../utils/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If server returns 401 on an authenticated request, clear stored credentials
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            if (!["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/"].includes(currentPath)) {
                removeToken();
                removeUser();
            }
        }
        return Promise.reject(error);
    }
);

export default api;