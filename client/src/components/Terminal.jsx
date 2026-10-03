import { useState } from "react";

function Terminal({
    stdin,
    onStdinChange,
    output,
    status,
    metrics,
    isRunning
}) {
    const [activeTab, setActiveTab] = useState("output"); // "output" | "stdin"

    function getStatusBadgeClass(stat) {
        if (!stat) return "";
        const lower = stat.toLowerCase();
        if (lower.includes("accepted") || lower.includes("success")) return "badge-success";
        if (lower.includes("time limit") || lower.includes("timeout")) return "badge-warning";
        return "badge-danger";
    }

    return (
        <div className="terminal-container">
            {/* Terminal Tab Header */}
            <div className="terminal-header">
                <div className="terminal-tabs">
                    <button
                        type="button"
                        className={`terminal-tab ${activeTab === "output" ? "active" : ""}`}
                        onClick={() => setActiveTab("output")}
                    >
                        <span>📟 Console Output</span>
                        {status && (
                            <span className={`badge ${getStatusBadgeClass(status)}`} style={{ marginLeft: "8px", fontSize: "10px" }}>
                                {status}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`terminal-tab ${activeTab === "stdin" ? "active" : ""}`}
                        onClick={() => setActiveTab("stdin")}
                    >
                        <span>⌨ STDIN Input</span>
                        {stdin ? (
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-cyan)", marginLeft: "6px" }}></span>
                        ) : null}
                    </button>
                </div>

                {metrics && (
                    <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {metrics.time && <span>⏱ {metrics.time}</span>}
                        {metrics.memory && <span>💾 {metrics.memory}</span>}
                    </div>
                )}
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
                {activeTab === "output" ? (
                    <pre className="terminal-output">
                        {isRunning ? (
                            <span style={{ color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="spinner-sm"></span>
                                <span>Executing program in isolated sandbox...</span>
                            </span>
                        ) : output ? (
                            output
                        ) : (
                            <span style={{ color: "var(--text-dim)" }}>
                                Output will appear here. Provide any input in the STDIN tab and press "Run Code" above.
                            </span>
                        )}
                    </pre>
                ) : (
                    <textarea
                        className="terminal-stdin"
                        value={stdin}
                        onChange={(e) => onStdinChange && onStdinChange(e.target.value)}
                        placeholder="Enter standard input values passed to your program (e.g. cin, input(), process.stdin)..."
                        spellCheck="false"
                    />
                )}
            </div>
        </div>
    );
}

export default Terminal;