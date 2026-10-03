import { useEffect, useRef, useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket";
import RemoteCursorWidget from "./RemoteCursorWidget";

function CodeEditor({
    roomId,
    initialCode,
    language,
    onLanguageChange,
    onRun,
    isRunning
}) {
    const [code, setCode] = useState(initialCode || "");
    const isRemoteUpdate = useRef(false);
    const debounceTimer = useRef(null);
    const throttleTimer = useRef(null);
    const typingTimer = useRef(null);
    const isTypingRef = useRef(false);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const widgetsRef = useRef({});

    // Update code when initialCode is loaded from room snapshot
    useEffect(() => {
        if (initialCode !== undefined && initialCode !== null) {
            setCode(initialCode);
        }
    }, [initialCode]);

    // Socket listeners for live code sync and remote cursor positions
    useEffect(() => {
        function handleCodeUpdate(newCode) {
            isRemoteUpdate.current = true;
            setCode(newCode);
        }

        function handleCursorUpdate(data) {
            if (!editorRef.current || !monacoRef.current) return;

            let widget = widgetsRef.current[data.userId];

            if (!widget) {
                widget = new RemoteCursorWidget(
                    monacoRef.current,
                    editorRef.current,
                    data.userId,
                    data.displayName || "Anonymous",
                    data.color || "#6366f1",
                    data.lineNumber || 1,
                    data.column || 1
                );
                widgetsRef.current[data.userId] = widget;
                editorRef.current.addContentWidget(widget);
            } else {
                widget.update(data.lineNumber, data.column, data.color);
            }
        }

        function handleUserLeft(userId) {
            const widget = widgetsRef.current[userId];
            if (widget && editorRef.current) {
                editorRef.current.removeContentWidget(widget);
                delete widgetsRef.current[userId];
            }
        }

        socket.on("code-update", handleCodeUpdate);
        socket.on("cursor-update", handleCursorUpdate);
        socket.on("user-left", handleUserLeft);

        return () => {
            socket.off("code-update", handleCodeUpdate);
            socket.off("cursor-update", handleCursorUpdate);
            socket.off("user-left", handleUserLeft);
        };
    }, []);

    // Cleanup typing states on unmount
    useEffect(() => {
        return () => {
            clearTimeout(debounceTimer.current);
            clearTimeout(throttleTimer.current);
            clearTimeout(typingTimer.current);

            if (isTypingRef.current) {
                socket.emit("typing-stop", { roomId });
            }
        };
    }, [roomId]);

    // Handle local user code changes
    function handleEditorChange(value) {
        if (value === undefined) return;
        setCode(value);

        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        // Start typing indicator
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit("typing-start", { roomId });
        }

        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.emit("typing-stop", { roomId });
        }, 1500);

        // Debounce code broadcast
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            socket.emit("code-change", {
                roomId,
                code: value
            });
        }, 80);
    }

    // Monaco Editor Mount
    const handleEditorMount = useCallback(
        (editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;

            editor.onDidChangeCursorPosition((event) => {
                if (throttleTimer.current) return;

                throttleTimer.current = setTimeout(() => {
                    throttleTimer.current = null;
                }, 40);

                socket.emit("cursor-change", {
                    roomId,
                    lineNumber: event.position.lineNumber,
                    column: event.position.column
                });
            });
        },
        [roomId]
    );

    function handleRun() {
        if (isRunning || !onRun) return;
        onRun(code);
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
                    value={code}
                    onChange={handleEditorChange}
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