import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import socket, { connectSocket } from "../socket/socket";
import CodeEditor from "../components/CodeEditor";
import Terminal from "../components/Terminal";
import Chat from "../components/Chat";
import { runCode } from "../services/executeService";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import "./RoomPage.css";

function RoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error: showError, info } = useToast();

    const [roomTitle, setRoomTitle] = useState("Collaborative Session");
    const [participants, setParticipants] = useState([]);
    const [initialCode, setInitialCode] = useState("");
    const [language, setLanguage] = useState("cpp");
    const [stdin, setStdin] = useState("");
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("");
    const [metrics, setMetrics] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const stdinDebounceRef = useRef(null);

    // Join room function
    const emitJoinRoom = useCallback(() => {
        if (!roomId) return;
        socket.emit("join-room", roomId);
    }, [roomId]);

    useEffect(() => {
        function handleConnect() {
            emitJoinRoom();
        }

        function handleJoinedRoom(data) {
            setRoomTitle(data.title || "Collaborative Session");
            setParticipants(
                (data.participants || []).map((p) => ({
                    ...p,
                    typing: false
                }))
            );
            setInitialCode(data.code || "");
            setLanguage(data.language || "cpp");
            setStdin(data.stdin || "");
            setOutput(data.output || "");
            setStatus(data.status || "");
            setMetrics(data.metrics || null);
            setChatMessages(data.messages || []);
            setCurrentUserId(data.currentUserId || null);
        }

        function handleLanguageUpdate(data) {
            if (!data?.language) return;
            setLanguage(data.language);
            setOutput("");
            setStatus("");
            setMetrics(null);
            info(`Language changed to ${data.language.toUpperCase()}`);
        }

        function handleUserJoined(participant) {
            setParticipants((prev) => {
                const exists = prev.some((p) => p.userId === participant.userId);
                if (exists) {
                    return prev.map((p) => (p.userId === participant.userId ? { ...p, ...participant } : p));
                }
                return [...prev, { ...participant, typing: false }];
            });
            info(`${participant.displayName || "A developer"} joined the room`);
        }

        function handleUserLeft(userId) {
            setParticipants((prev) => {
                const leavingUser = prev.find((p) => p.userId === userId);
                if (leavingUser) {
                    info(`${leavingUser.displayName || "A participant"} left the session`);
                }
                return prev.filter((p) => p.userId !== userId);
            });
        }

        function handleParticipantTyping({ userId }) {
            setParticipants((prev) =>
                prev.map((p) => (p.userId === userId ? { ...p, typing: true } : p))
            );
        }

        function handleParticipantStopTyping({ userId }) {
            setParticipants((prev) =>
                prev.map((p) => (p.userId === userId ? { ...p, typing: false } : p))
            );
        }

        // Synchronize STDIN input across collaborators
        function handleStdinUpdate(syncedStdin) {
            setStdin(syncedStdin || "");
        }

        // Synchronize execution lifecycle (Start)
        function handleExecutionStarted(data) {
            setIsRunning(true);
            setOutput("");
            setStatus("RUNNING");
            setMetrics(null);
            info(`${data.displayName || "A collaborator"} started code execution...`);
        }

        // Synchronize execution lifecycle (Result)
        function handleTerminalUpdate(data) {
            setIsRunning(false);
            setOutput(data.output || "");
            setStatus(data.status || "Accepted");
            setMetrics(data.metrics || null);

            if (data.status === "Accepted" || data.status === "SUCCESS") {
                success(`${data.displayName || "Collaborator"} execution completed!`);
            } else if (data.status === "Compilation Error") {
                showError(`${data.displayName || "Collaborator"} compilation error.`);
            }
        }

        function handleRoomError(err) {
            showError(err.message || "Room error encountered");
            navigate("/dashboard");
        }

        function handleConnectError(err) {
            console.warn("Socket connection error:", err.message);
        }

        socket.on("connect", handleConnect);
        socket.on("joined-room", handleJoinedRoom);
        socket.on("user-joined", handleUserJoined);
        socket.on("user-left", handleUserLeft);
        socket.on("participant-typing", handleParticipantTyping);
        socket.on("participant-stopped-typing", handleParticipantStopTyping);
        socket.on("language-update", handleLanguageUpdate);
        socket.on("stdin-update", handleStdinUpdate);
        socket.on("execution-started", handleExecutionStarted);
        socket.on("terminal-update", handleTerminalUpdate);
        socket.on("room-error", handleRoomError);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            emitJoinRoom();
        } else {
            connectSocket();
        }

        return () => {
            clearTimeout(stdinDebounceRef.current);
            socket.emit("leave-room", { roomId });
            socket.off("connect", handleConnect);
            socket.off("joined-room", handleJoinedRoom);
            socket.off("user-joined", handleUserJoined);
            socket.off("user-left", handleUserLeft);
            socket.off("participant-typing", handleParticipantTyping);
            socket.off("participant-stopped-typing", handleParticipantStopTyping);
            socket.off("language-update", handleLanguageUpdate);
            socket.off("stdin-update", handleStdinUpdate);
            socket.off("execution-started", handleExecutionStarted);
            socket.off("terminal-update", handleTerminalUpdate);
            socket.off("room-error", handleRoomError);
            socket.off("connect_error", handleConnectError);
        };
    }, [roomId, emitJoinRoom, navigate]);

    function handleStdinChange(newStdin) {
        setStdin(newStdin);

        clearTimeout(stdinDebounceRef.current);
        stdinDebounceRef.current = setTimeout(() => {
            socket.emit("stdin-change", {
                roomId,
                stdin: newStdin
            });
        }, 150);
    }

    function handleLanguageChange(newLanguage) {
        if (newLanguage === language) return;
        setLanguage(newLanguage);
        setOutput("");
        setStatus("");
        setMetrics(null);

        socket.emit("language-change", {
            roomId,
            language: newLanguage
        });
    }

    async function handleRun(code) {
        if (isRunning) return;

        setOutput("");
        setStatus("RUNNING");
        setMetrics(null);
        setIsRunning(true);

        // Notify room that execution has started
        socket.emit("execution-start", { roomId });

        try {
            const data = await runCode({
                language,
                code,
                stdin
            });

            if (!data.success || !data.result) {
                const failStatus = "ERROR";
                const failOutput = data.message || "Code execution failed.";
                setStatus(failStatus);
                setOutput(failOutput);

                socket.emit("execution-result", {
                    roomId,
                    output: failOutput,
                    status: failStatus,
                    metrics: null
                });
                return;
            }

            const result = data.result;
            const finalStatus = result.status?.description || "Accepted";

            const finalMetrics = (result.time || result.memory) ? {
                time: result.time,
                memory: result.memory
            } : null;

            setMetrics(finalMetrics);
            setStatus(finalStatus);

            const finalOutput =
                result.stdout ||
                result.compileOutput ||
                result.stderr ||
                result.message ||
                "Program finished with no standard output.";

            setOutput(finalOutput);

            if (result.status?.id === 3) {
                success("Execution finished successfully!");
            } else if (result.status?.id === 6) {
                showError("Compilation error encountered.");
            }

            // Broadcast final terminal state to all peers in the room
            socket.emit("execution-result", {
                roomId,
                output: finalOutput,
                status: finalStatus,
                metrics: finalMetrics
            });

        } catch (err) {
            console.error("Execution error:", err);
            const errStatus = "SYSTEM_ERROR";
            const errOutput = err.response?.data?.message || err.message || "Failed to contact execution server.";
            setStatus(errStatus);
            setOutput(errOutput);
            showError("Execution request failed.");

            socket.emit("execution-result", {
                roomId,
                output: errOutput,
                status: errStatus,
                metrics: null
            });
        } finally {
            setIsRunning(false);
        }
    }

    function handleCopyRoomId() {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        success(`Room ID "${roomId}" copied to clipboard!`);
    }

    function handleLeaveRoom() {
        socket.emit("leave-room", { roomId });
        navigate("/dashboard");
    }

    return (
        <div className="room-page">
            {/* Top Workspace Header */}
            <header className="room-header">
                <div className="room-header-left">
                    <Link to="/dashboard" className="btn btn-secondary btn-sm" title="Back to Dashboard">
                        ← Dashboard
                    </Link>
                    <div className="room-title-area">
                        <span className="room-title-text">{roomTitle}</span>
                        <div
                            className="room-id-pill"
                            onClick={handleCopyRoomId}
                            title="Click to copy Room ID"
                        >
                            <span>📋 {roomId}</span>
                            <span style={{ fontSize: "10px", opacity: 0.8 }}>(Copy ID)</span>
                        </div>
                    </div>
                </div>

                <div className="room-header-right">
                    <span className="badge badge-success">
                        ● {participants.length} ONLINE
                    </span>
                    <button
                        type="button"
                        onClick={handleLeaveRoom}
                        className="btn btn-danger btn-sm"
                    >
                        Leave Room
                    </button>
                </div>
            </header>

            {/* LeetCode-Style 2D Resizable Workspace Layout */}
            <div className="room-layout-container">
                <Group orientation="horizontal" className="main-horizontal-group">
                    {/* Left Column: Code Editor (Top) & Terminal (Bottom) */}
                    <Panel defaultSize="70%" minSize="35%">
                        <Group orientation="vertical" className="left-vertical-group">
                            {/* Top: Code Editor */}
                            <Panel defaultSize="62%" minSize="25%" className="editor-section">
                                <CodeEditor
                                    roomId={roomId}
                                    initialCode={initialCode}
                                    language={language}
                                    onLanguageChange={handleLanguageChange}
                                    onRun={handleRun}
                                    isRunning={isRunning}
                                />
                            </Panel>

                            {/* Horizontal Gutter (Editor ⬍ Terminal) */}
                            <Separator className="gutter-h" />

                            {/* Bottom: Terminal */}
                            <Panel defaultSize="38%" minSize="15%" className="terminal-section">
                                <Terminal
                                    stdin={stdin}
                                    onStdinChange={handleStdinChange}
                                    output={output}
                                    status={status}
                                    metrics={metrics}
                                    isRunning={isRunning}
                                />
                            </Panel>
                        </Group>
                    </Panel>

                    {/* Vertical Gutter (Left Coding Column ⬌ Right Sidebar) */}
                    <Separator className="gutter-v" />

                    {/* Right Column: Participants (Top) & In-Room Chat (Bottom) */}
                    <Panel defaultSize="30%" minSize="220px" maxSize="55%">
                        <Group orientation="vertical" className="right-vertical-group">
                            {/* Top: Participants List */}
                            <Panel defaultSize="35%" minSize="100px" maxSize="60%" className="participants-section">
                                <div className="section-header">
                                    <span>Participants ({participants.length})</span>
                                    <span className="badge badge-primary">
                                        {participants.length}
                                    </span>
                                </div>

                                <div className="participants-list">
                                    {participants.map((participant) => (
                                        <div key={participant.userId} className="participant-card">
                                            <div className="participant-info">
                                                <div
                                                    className="participant-avatar-pill"
                                                    style={{ background: participant.color || "var(--primary)" }}
                                                >
                                                    {participant.displayName ? participant.displayName.charAt(0).toUpperCase() : "U"}
                                                </div>
                                                <span className="participant-name">
                                                    {participant.displayName}
                                                    {participant.userId === currentUserId && " (You)"}
                                                </span>
                                            </div>

                                            {participant.typing ? (
                                                <span className="participant-typing-badge">Typing...</span>
                                            ) : (
                                                <span style={{ fontSize: "10px", color: "var(--accent-emerald)" }}>● Active</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Panel>

                            {/* Horizontal Gutter (Participants ⬍ Chat) */}
                            <Separator className="gutter-h" />

                            {/* Bottom: In-Room Chat */}
                            <Panel defaultSize="65%" minSize="150px" className="chat-section">
                                <Chat
                                    roomId={roomId}
                                    initialMessages={chatMessages}
                                    currentUserId={currentUserId}
                                />
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>
    );
}

export default RoomPage;