import { useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import socket from "../socket/socket";
import RemoteCursorWidget from "./RemoteCursorWidget";

function CodeEditor({
    roomId,
    initialCode,
    initialYjsUpdate,
    language,
    onLanguageChange,
    onRun,
    isRunning,
    currentUserId,
    participants
}) {
    const yDocRef = useRef(null);
    const yTextRef = useRef(null);
    const bindingRef = useRef(null);
    const hasInitializedYjs = useRef(false);

    const throttleTimer = useRef(null);
    const typingTimer = useRef(null);
    const isTypingRef = useRef(false);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const widgetsRef = useRef({});
    const pendingCursorsRef = useRef({});
    const latestCursorPos = useRef(null);
    const hasActiveCursor = useRef(false);

    // Initialize Y.Doc once
    if (!yDocRef.current) {
        const doc = new Y.Doc();
        yDocRef.current = doc;
        yTextRef.current = doc.getText("monaco");

        // Broadcast local operations to peers via socket
        doc.on("update", (update, origin) => {
            if (origin !== "remote" && roomId) {
                socket.emit("yjs-update", {
                    roomId,
                    update // Send binary natively
                });
            }
        });
    }

    // Apply initial Yjs snapshot when received from RoomPage snapshot
    useEffect(() => {
        if (initialYjsUpdate && yDocRef.current && !hasInitializedYjs.current) {
            try {
                hasInitializedYjs.current = true;
                Y.applyUpdate(yDocRef.current, new Uint8Array(initialYjsUpdate), "remote");
            } catch (err) {
                console.error("Failed to apply initial Yjs update from snapshot:", err);
            }
        }
    }, [initialYjsUpdate]);

    // Cleanup Yjs document and binding on unmount
    useEffect(() => {
        return () => {
            if (bindingRef.current) {
                try {
                    bindingRef.current.destroy();
                } catch (e) {
                    // ignore cleanup error
                }
                bindingRef.current = null;
            }
            if (yDocRef.current) {
                try {
                    yDocRef.current.destroy();
                } catch (e) {
                    // ignore cleanup error
                }
                yDocRef.current = null;
            }
            // Reset initialization flag for React Strict Mode remounts
            hasInitializedYjs.current = false;
        };
    }, []);

    // Helper to add or update remote cursor widget
    const syncRemoteCursor = useCallback((userId, displayName, color, lineNumber, column) => {
        if (!userId || String(userId) === String(currentUserId)) return;

        if (!editorRef.current || !monacoRef.current) {
            pendingCursorsRef.current[userId] = {
                userId,
                displayName,
                color,
                lineNumber,
                column
            };
            return;
        }

        let widget = widgetsRef.current[userId];
        if (!widget) {
            widget = new RemoteCursorWidget(
                monacoRef.current,
                editorRef.current,
                userId,
                displayName || "Anonymous",
                color || "#DEDBC8",
                lineNumber || 1,
                column || 1
            );
            widgetsRef.current[userId] = widget;
            editorRef.current.addContentWidget(widget);
        } else {
            widget.update(lineNumber, column, color, displayName);
        }
    }, [currentUserId]);

    // Synchronize initial cursors from room participants
    useEffect(() => {
        if (!participants || !editorRef.current || !monacoRef.current) return;
        participants.forEach((p) => {
            if (String(p.userId) !== String(currentUserId) && p.cursor) {
                syncRemoteCursor(
                    p.userId,
                    p.displayName,
                    p.color,
                    p.cursor.lineNumber,
                    p.cursor.column
                );
            }
        });
    }, [participants, currentUserId, syncRemoteCursor]);

    // Socket listeners for Yjs CRDT sync and remote cursor positions
    useEffect(() => {
        function handleYjsUpdate(updateData) {
            if (!yDocRef.current || !updateData) return;
            try {
                const updateUint8 = new Uint8Array(updateData);
                Y.applyUpdate(yDocRef.current, updateUint8, "remote");
            } catch (err) {
                console.error("Failed to apply remote Yjs update:", err);
            }
        }

        function handleYjsInit(stateData) {
            if (!yDocRef.current || !stateData) return;
            try {
                hasInitializedYjs.current = true;
                const stateUint8 = new Uint8Array(stateData);
                Y.applyUpdate(yDocRef.current, stateUint8, "remote");
            } catch (err) {
                console.error("Failed to apply Yjs init state:", err);
            }
        }

        function handleCursorUpdate(data) {
            if (!data || !data.userId || String(data.userId) === String(currentUserId)) return;
            syncRemoteCursor(
                data.userId,
                data.displayName,
                data.color,
                data.lineNumber,
                data.column
            );
        }

        function handleCursorHidden({ userId }) {
            const widget = widgetsRef.current[userId];
            if (widget && editorRef.current) {
                editorRef.current.removeContentWidget(widget);
                delete widgetsRef.current[userId];
            }
            delete pendingCursorsRef.current[userId];
        }

        function handleUserJoined(participant) {
            if (
                editorRef.current &&
                roomId &&
                String(participant?.userId) !== String(currentUserId) &&
                hasActiveCursor.current &&
                editorRef.current.hasTextFocus()
            ) {
                const pos = editorRef.current.getPosition();
                if (pos) {
                    socket.emit("cursor-change", {
                        roomId,
                        lineNumber: pos.lineNumber,
                        column: pos.column
                    });
                }
            }
        }

        function handleUserLeft(userId) {
            const widget = widgetsRef.current[userId];
            if (widget && editorRef.current) {
                editorRef.current.removeContentWidget(widget);
                delete widgetsRef.current[userId];
            }
            delete pendingCursorsRef.current[userId];
        }

        socket.on("yjs-update", handleYjsUpdate);
        socket.on("yjs-init", handleYjsInit);
        socket.on("cursor-update", handleCursorUpdate);
        socket.on("cursor-hidden", handleCursorHidden);
        socket.on("user-joined", handleUserJoined);
        socket.on("user-left", handleUserLeft);

        return () => {
            socket.off("yjs-update", handleYjsUpdate);
            socket.off("yjs-init", handleYjsInit);
            socket.off("cursor-update", handleCursorUpdate);
            socket.off("cursor-hidden", handleCursorHidden);
            socket.off("user-joined", handleUserJoined);
            socket.off("user-left", handleUserLeft);

            if (editorRef.current) {
                Object.values(widgetsRef.current).forEach((w) => {
                    try {
                        editorRef.current.removeContentWidget(w);
                    } catch (e) {
                        // ignore unmount errors
                    }
                });
            }
            widgetsRef.current = {};
        };
    }, [roomId, currentUserId, syncRemoteCursor]);

    // Cleanup typing states on unmount
    useEffect(() => {
        return () => {
            clearTimeout(throttleTimer.current);
            clearTimeout(typingTimer.current);

            if (isTypingRef.current && roomId) {
                socket.emit("typing-stop", { roomId });
            }
        };
    }, [roomId]);

    // Monaco Editor Mount
    const handleEditorMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            if (import.meta.env.DEV) {
                window.__editor = editor;
                window.__monaco = monaco;
            }

            // Fix for y-monaco CRDT index desyncs: Force LF instead of CRLF
            const model = editor.getModel();
            if (model) {
                model.setEOL(monaco.editor.EndOfLineSequence.LF);
            }

            const doc = yDocRef.current;
            const ytext = yTextRef.current;

            // Apply initial snapshot if available and not yet applied
            if (initialYjsUpdate && !hasInitializedYjs.current) {
                hasInitializedYjs.current = true;
                try {
                    Y.applyUpdate(doc, new Uint8Array(initialYjsUpdate), "remote");
                } catch (e) {
                    console.error("Error applying initialYjsUpdate on mount:", e);
                }
            } else if (!roomId && initialCode && ytext.length === 0) {
                // Non-room standalone fallback
                ytext.insert(0, initialCode);
            }

            // Create Monaco Binding to synchronize Monaco Model with Y.Text
            if (bindingRef.current) {
                try {
                    bindingRef.current.destroy();
                } catch (e) {
                    // ignore
                }
            }
            bindingRef.current = new MonacoBinding(
                ytext,
                editor.getModel(),
                new Set([editor]),
                null
            );

            // Fetch the authoritative state from the server
            if (roomId) {
                socket.emit("get-yjs-state", { roomId });
            }

            // Track user typing indicator when local user types
            editor.onDidChangeModelContent(() => {
                if (editor.hasTextFocus() && roomId) {
                    if (!isTypingRef.current) {
                        isTypingRef.current = true;
                        socket.emit("typing-start", { roomId });
                    }

                    clearTimeout(typingTimer.current);
                    typingTimer.current = setTimeout(() => {
                        isTypingRef.current = false;
                        socket.emit("typing-stop", { roomId });
                    }, 1500);
                }
            });

            // Flush any pending remote cursors received while Monaco was initializing
            Object.values(pendingCursorsRef.current).forEach((cur) => {
                syncRemoteCursor(
                    cur.userId,
                    cur.displayName,
                    cur.color,
                    cur.lineNumber,
                    cur.column
                );
            });
            pendingCursorsRef.current = {};

            // Broadcast cursor when editor gains focus
            editor.onDidFocusEditorText(() => {
                hasActiveCursor.current = true;
                const pos = editor.getPosition();
                if (pos && roomId) {
                    socket.emit("cursor-change", {
                        roomId,
                        lineNumber: pos.lineNumber,
                        column: pos.column
                    });
                }
            });

            // Hide remote cursor when editor loses focus
            editor.onDidBlurEditorText(() => {
                hasActiveCursor.current = false;
                if (roomId) {
                    socket.emit("cursor-blur", { roomId });
                }
            });

            // Throttle cursor movement updates
            editor.onDidChangeCursorPosition((event) => {
                if (!editor.hasTextFocus()) return;
                hasActiveCursor.current = true;

                latestCursorPos.current = {
                    lineNumber: event.position.lineNumber,
                    column: event.position.column
                };

                if (!throttleTimer.current) {
                    socket.emit("cursor-change", {
                        roomId,
                        ...latestCursorPos.current
                    });

                    throttleTimer.current = setTimeout(() => {
                        throttleTimer.current = null;
                        if (latestCursorPos.current && editor.hasTextFocus()) {
                            socket.emit("cursor-change", {
                                roomId,
                                ...latestCursorPos.current
                            });
                        }
                    }, 40);
                }
            });
        },
        [roomId, initialCode, initialYjsUpdate, syncRemoteCursor]
    );

    function handleRun() {
        if (isRunning || !onRun) return;
        const currentCode = editorRef.current
            ? editorRef.current.getValue()
            : yTextRef.current
            ? yTextRef.current.toString()
            : initialCode || "";
        onRun(currentCode);
    }

    // Monaco language mapping
    const monacoLanguage = language === "csharp" ? "csharp" : language === "cpp" ? "cpp" : language;

    return (
        <div className="code-editor-wrapper">
            <div className="editor-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Language:
                    </span>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="language-select"
                        disabled={isRunning}
                    >
                        <option value="cpp">C++ (GCC 10)</option>
                        <option value="python">Python (3.10)</option>
                        <option value="javascript">JavaScript (Node 18)</option>
                        <option value="typescript">TypeScript (5.0)</option>
                        <option value="java">Java (15)</option>
                        <option value="go">Go (1.16)</option>
                        <option value="rust">Rust (1.68)</option>
                        <option value="csharp">C# (.NET)</option>
                    </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        type="button"
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`btn ${isRunning ? "btn-secondary" : "btn-success"} btn-sm`}
                        style={{ minWidth: "110px" }}
                    >
                        {isRunning ? (
                            <>
                                <span className="spinner-sm"></span>
                                <span>Running...</span>
                            </>
                        ) : (
                            <>
                                <span>▶</span>
                                <span>Run Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="monaco-container">
                <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={monacoLanguage}
                    defaultValue={initialCode || ""}
                    onMount={handleEditorMount}
                    options={{
                        automaticLayout: true,
                        minimap: { enabled: true, maxColumn: 40 },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        fontLigatures: true,
                        tabSize: 4,
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        bracketPairColorization: { enabled: true },
                        renderLineHighlight: "all",
                        lineNumbersMinChars: 3,
                        padding: { top: 12, bottom: 12 }
                    }}
                />
            </div>
        </div>
    );
}

export default CodeEditor;