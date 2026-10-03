import { createContext, useState, useEffect } from "react";
import { getUser, getToken, removeToken, removeUser, saveUser } from "../utils/auth";
import { getCurrentUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initializeAuth() {
            const token = getToken();
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const freshUser = await getCurrentUser();
                if (freshUser) {
                    saveUser(freshUser);
                    setUser(freshUser);
                } else {
                    removeToken();
                    removeUser();
                    setUser(null);
                }
            } catch (err) {
                // If token expired or invalid
                removeToken();
                removeUser();
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;