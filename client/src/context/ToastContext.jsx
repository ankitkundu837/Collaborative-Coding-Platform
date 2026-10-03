import { createContext, useState, useCallback, useRef } from "react";

export const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const recentToastsRef = useRef(new Map());

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = "info", duration = 4000) => {
        if (!message || typeof message !== "string") return null;

        const now = Date.now();
        const key = `${type}:${message.trim()}`;
        const lastTime = recentToastsRef.current.get(key);

        // Deduplicate identical toasts fired within 1500ms
        if (lastTime && now - lastTime < 1500) {
            return null;
        }
        recentToastsRef.current.set(key, now);

        // Clean up old entries periodically
        if (recentToastsRef.current.size > 50) {
            for (const [k, time] of recentToastsRef.current.entries()) {
                if (now - time > 5000) {
                    recentToastsRef.current.delete(k);
                }
            }
        }

        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id;
    }, [removeToast]);

    const success = useCallback((msg, duration) => addToast(msg, "success", duration), [addToast]);
    const error = useCallback((msg, duration) => addToast(msg, "error", duration || 5000), [addToast]);
    const info = useCallback((msg, duration) => addToast(msg, "info", duration), [addToast]);
    const warning = useCallback((msg, duration) => addToast(msg, "warning", duration), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            {/* Toast Container */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-item toast-${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className="toast-icon">
                            {toast.type === "success" && "✓"}
                            {toast.type === "error" && "✕"}
                            {toast.type === "warning" && "⚠"}
                            {toast.type === "info" && "ℹ"}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                        <button
                            type="button"
                            className="toast-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;
