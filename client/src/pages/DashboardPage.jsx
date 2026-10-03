import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateRoomCard from "../components/CreateRoomCard";
import JoinRoomCard from "../components/JoinRoomCard";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getMyRooms } from "../services/roomService";

function DashboardPage() {
    const { user } = useAuth();
    const { success } = useToast();
    const [recentRooms, setRecentRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const rooms = await getMyRooms();
                setRecentRooms(rooms);
            } catch (err) {
                console.error("Failed to load user rooms:", err);
            } finally {
                setLoadingRooms(false);
            }
        }
        fetchRooms();
    }, []);

    function handleCopyId(e, roomId) {
        e.stopPropagation();
        navigator.clipboard.writeText(roomId);
        success(`Room ID "${roomId}" copied to clipboard!`);
    }

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
            {/* User Greeting Banner */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <span className="badge badge-primary" style={{ marginBottom: "10px" }}>
                        Active Session
                    </span>
                    <h1 style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                        Developer Workspace
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" }}>
                        Welcome back, <strong style={{ color: "var(--text-main)" }}>{user?.email}</strong>. Launch a new session or rejoin previous rooms.
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "48px" }}>
                <CreateRoomCard />
                <JoinRoomCard />
            </div>

            {/* Recent Rooms Section */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Your Recent Rooms</h2>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Persisted workspaces hosted by your account</p>
                    </div>
                </div>

                {loadingRooms ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
                        Loading your active rooms...
                    </div>
                ) : recentRooms.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                        <div style={{ fontSize: "36px", marginBottom: "12px" }}>💻</div>
                        <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>No workspaces created yet</h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 16px" }}>
                            Create your first collaborative session above to invite peers, write code, and run programs together.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                        {recentRooms.map((room) => (
                            <div key={room.roomId} className="card card-interactive" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                                            {room.title || "Collaborative Session"}
                                        </h3>
                                        <span className="badge badge-primary">
                                            {room.language.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", background: "var(--bg-input)", padding: "2px 6px", borderRadius: "4px" }}>
                                            {room.roomId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => handleCopyId(e, room.roomId)}
                                            style={{ background: "none", border: "none", color: "var(--primary-light)", cursor: "pointer", fontSize: "12px" }}
                                            title="Copy Room ID"
                                        >
                                            📋 Copy ID
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "8px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                        {new Date(room.lastActiveAt || room.createdAt).toLocaleDateString()}
                                    </span>
                                    <Link to={`/room/${room.roomId}`} className="btn btn-secondary btn-sm">
                                        Open Session →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;