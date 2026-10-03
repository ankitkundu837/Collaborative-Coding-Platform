import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../services/roomService";
import { useToast } from "../hooks/useToast";

function JoinRoomCard() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [roomId, setRoomId] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleJoinRoom(e) {
        e.preventDefault();

        if (!roomId.trim()) {
            showError("Please enter a Room ID");
            return;
        }

        const cleanId = roomId.trim();
        setLoading(true);

        try {
            await joinRoom(cleanId);
            success("Room found! Connecting...");
            navigate(`/room/${cleanId}`);
        } catch (err) {
            showError(err.response?.data?.message || "Could not find room with this ID.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card card-interactive" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                    🔗
                </div>
                <div>
                    <h3 style={{ fontSize: "18px" }}>Join Existing Room</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Collaborate in a shared workspace</p>
                </div>
            </div>

            <form onSubmit={handleJoinRoom} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="input-group">
                    <label className="input-label" htmlFor="join-room-id">Room ID or Invite Code</label>
                    <input
                        id="join-room-id"
                        className="input-field"
                        type="text"
                        placeholder="e.g. k9Xq2_1aZ0"
                        required
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                </div>

                <div style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "16px" }}>
                    💡 Ask the room host for their 10-character Room ID or copy link.
                </div>

                <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                    <button
                        type="submit"
                        className="btn btn-secondary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Connecting..." : "Join Workspace →"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default JoinRoomCard;