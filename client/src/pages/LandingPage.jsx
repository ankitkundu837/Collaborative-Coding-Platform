import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LandingPage() {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
            {/* Hero Section */}
            <div style={{ maxWidth: "800px", margin: "0 auto 60px" }}>
                <div className="badge badge-primary" style={{ marginBottom: "20px" }}>
                    ⚡ Real-Time Collaborative IDE
                </div>
                <h1 style={{ fontSize: "52px", fontWeight: "800", letterSpacing: "-1.5px", marginBottom: "20px" }}>
                    Code Together in Real Time, <br />
                    <span style={{ background: "linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Execute Instantly in the Cloud
                    </span>
                </h1>
                <p style={{ fontSize: "18px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "36px" }}>
                    CodeSync delivers a low-latency, full-featured collaborative development environment. Pair program, interview candidates, debug complex algorithms, and run code in 8+ languages right from your browser.
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                    {user ? (
                        <Link to="/dashboard" className="btn btn-primary btn-lg">
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start Coding for Free →
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Code Mockup Card */}
            <div className="card card-glass" style={{ maxWidth: "960px", margin: "0 auto 80px", padding: "20px", borderRadius: "16px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }}></div>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b" }}></div>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981" }}></div>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        room://cs-9x4k21a • C++ Session
                    </span>
                    <span className="badge badge-success">2 Online</span>
                </div>
                <pre style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#e2e8f0", lineHeight: "1.7", overflowX: "auto" }}>
                    <code>{`#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Live collaboration with remote cursor indicators
int main() {
    vector<string> stack = {"React", "Node.js", "Socket.IO", "Monaco", "Judge0"};
    cout << "🚀 Collaborative Coding Platform Active!" << endl;
    return 0;
}`}</code>
                </pre>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", textAlign: "left" }}>
                <div className="card card-interactive">
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚡</div>
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Instant Live Synchronization</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Sub-50ms WebSocket latency ensures every keystroke and cursor movement is mirrored instantaneously across all participants.
                    </p>
                </div>

                <div className="card card-interactive">
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>🛡️</div>
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Sandboxed Multi-Language Execution</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Execute C++, Python, JavaScript, Java, Go, Rust, and C# securely with STDIN/STDOUT stream support and resource limits.
                    </p>
                </div>

                <div className="card card-interactive">
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>💬</div>
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Integrated Real-Time Chat</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Discuss logic, share notes, and see live typing indicators right alongside your code without switching contexts.
                    </p>
                </div>

                <div className="card card-interactive">
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔒</div>
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Production Security & Auth</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Protected by cryptographically hashed OTP verification, JWT session tokens, rate limiting, and HTTP security headers.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;