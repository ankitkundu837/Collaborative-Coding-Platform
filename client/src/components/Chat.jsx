import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

function Chat({
    roomId,
    initialMessages = [],
    currentUserId
}) {
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");
    const [typingUsers, setTypingUsers] = useState({});

    const messagesEndRef = useRef(null);
    const typingTimersRef = useRef({});
    const isTypingRef = useRef(false);
    const stopTypingTimerRef = useRef(null);

    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        function handleChatMessage(newMessage) {
            setMessages((prev) => [...prev, newMessage]);
        }

        function handleChatUserTyping(data) {
            if (data.userId === currentUserId) return;

            setTypingUsers((prev) => ({
                ...prev,
                [data.userId]: data.displayName
            }));

            if (typingTimersRef.current[data.userId]) {
                clearTimeout(typingTimersRef.current[data.userId]);
            }

            typingTimersRef.current[data.userId] = setTimeout(() => {
                setTypingUsers((prev) => {
                    const updated = { ...prev };
                    delete updated[data.userId];
                    return updated;
                });
            }, 3000);
        }

        function handleChatUserStoppedTyping(data) {
            setTypingUsers((prev) => {
                const updated = { ...prev };
                delete updated[data.userId];
                return updated;
            });

            if (typingTimersRef.current[data.userId]) {
                clearTimeout(typingTimersRef.current[data.userId]);
                delete typingTimersRef.current[data.userId];
            }
        }

        socket.on("chat-message", handleChatMessage);
        socket.on("chat-user-typing", handleChatUserTyping);
        socket.on("chat-user-stopped-typing", handleChatUserStoppedTyping);

        return () => {
            socket.off("chat-message", handleChatMessage);
            socket.off("chat-user-typing", handleChatUserTyping);
            socket.off("chat-user-stopped-typing", handleChatUserStoppedTyping);
        };
    }, [currentUserId]);

    useEffect(() => {
        return () => {
            clearTimeout(stopTypingTimerRef.current);
            Object.values(typingTimersRef.current).forEach((t) => clearTimeout(t));
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleMessageChange(e) {
        const val = e.target.value;
        setMessage(val);

        if (!val.trim()) {
            if (isTypingRef.current) {
                socket.emit("chat-typing-stop", { roomId });
                isTypingRef.current = false;
            }
            clearTimeout(stopTypingTimerRef.current);
            return;
        }

        if (!isTypingRef.current) {
            socket.emit("chat-typing-start", { roomId });
            isTypingRef.current = true;
        }

        clearTimeout(stopTypingTimerRef.current);
        stopTypingTimerRef.current = setTimeout(() => {
            socket.emit("chat-typing-stop", { roomId });
            isTypingRef.current = false;
        }, 2000);
    }

    function sendMessage() {
        const trimmed = message.trim();
        if (!trimmed) return;

        if (isTypingRef.current) {
            socket.emit("chat-typing-stop", { roomId });
            isTypingRef.current = false;
        }

        clearTimeout(stopTypingTimerRef.current);

        socket.emit("send-message", {
            roomId,
            message: trimmed
        });

        setMessage("");
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function formatTime(timestamp) {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    const typingNames = Object.values(typingUsers);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>💬 In-Room Chat</span>
                    <span className="badge badge-primary" style={{ fontSize: "10px" }}>
                        {messages.length}
                    </span>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>💭</div>
                        <p style={{ fontWeight: 600 }}>No messages yet</p>
                        <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                            Start a conversation with participants in this room.
                        </p>
                    </div>
                ) : (
                    messages.map((chatMessage) => {
                        const isMe = chatMessage.userId === currentUserId;
                        return (
                            <div
                                key={chatMessage.id}
                                className={`chat-message ${isMe ? "own-message" : ""}`}
                            >
                                <div className="chat-message-top">
                                    <span style={{ fontWeight: 700, color: isMe ? "#c7d2fe" : chatMessage.color || "#818cf8", fontSize: "12px" }}>
                                        {isMe ? "You" : chatMessage.displayName}
                                    </span>
                                    <small>{formatTime(chatMessage.timestamp)}</small>
                                </div>
                                <div className="chat-message-text">{chatMessage.message}</div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* In-Chat Typing Indicator */}
            {typingNames.length > 0 && (
                <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span>
                        {typingNames.length === 1
                            ? `${typingNames[0]} is typing...`
                            : `${typingNames.slice(0, 2).join(", ")} are typing...`}
                    </span>
                </div>
            )}

            {/* Chat Input */}
            <div className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message (Press Enter to send)..."
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={sendMessage}
                    disabled={!message.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;