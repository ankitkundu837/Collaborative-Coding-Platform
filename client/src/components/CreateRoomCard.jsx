import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/roomService";
import { useToast } from "../hooks/useToast";

function CreateRoomCard() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [loading, setLoading] = useState(false);

    async function handleCreateRoom(e) {
        e.preventDefault();

        try {
            setLoading(true);
            const data = await createRoom({
                title: title.trim() || "Collaborative Session",
                language
            });

            success("Room created! Joining workspace...");
            navigate(`/room/${data.roomId}`);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to create room.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card card-interactive" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                    🚀
                </div>
                <div>
                    <h3 style={{ fontSize: "18px" }}>Create New Room</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Spin up an instant live workspace</p>
                </div>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="input-group">
                    <label className="input-label" htmlFor="room-title">Session Title (Optional)</label>
                    <input
                        id="room-title"
                        className="input-field"
                        type="text"
                        placeholder="e.g. Dynamic Programming Interview"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" htmlFor="room-language">Default Language</label>
                    <select
                        id="room-language"
                        className="input-field"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ cursor: "pointer" }}
                    >
                        <option value="cpp">C++ (GCC)</option>
                        <option value="python">Python 3</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="csharp">C#</option>
                    </select>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "12px" }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Creating Session..." : "Create & Launch Room →"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateRoomCard;