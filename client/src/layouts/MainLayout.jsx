import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { logout } from "../services/authService";

function MainLayout() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { success } = useToast();

    // Check if currently inside a room editor view or landing page
    const isRoomPage = location.pathname.startsWith("/room/");
    const isLandingPage = location.pathname === "/" || location.pathname === "";
    
    // Auth-related pages (login, signup/register, forgot-password, verify-otp, reset-password, change-password)
    const isAuthPage = [
        "/login",
        "/register",
        "/forgot-password",
        "/verify-otp",
        "/reset-password",
        "/change-password"
    ].includes(location.pathname);

    function handleLogout() {
        logout();
        setUser(null);
        success("Logged out successfully");
        navigate("/login");
    }

    return (
        <div className="app-wrapper">
            {!isRoomPage && !isLandingPage && (
                <header className="navbar">
                    <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
                        <div className="navbar-logo-icon">&lt;/&gt;</div>
                        <span>CodeSync</span>
                        <span style={{ color: "#DEDBC8", fontSize: "14px", fontWeight: 700 }}>*</span>
                    </Link>

                    {/* Middle Zone: Clean text navigation links */}
                    {!user ? (
                        <nav className="navbar-links" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            <Link to="/#about" className="nav-link-text">Mission Control</Link>
                            <Link to="/#features" className="nav-link-text">Capabilities</Link>
                            <Link to="/#showcase" className="nav-link-text">Live Triage</Link>
                            <Link to="/#compare" className="nav-link-text">Contest vs Generic</Link>
                        </nav>
                    ) : (
                        <nav className="navbar-links" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                            <Link to="/dashboard" className="nav-link-text">Dashboard</Link>
                            <Link to="/#features" className="nav-link-text">Capabilities</Link>
                            <Link to="/#runtimes" className="nav-link-text">Runtimes</Link>
                        </nav>
                    )}

                    {/* Right Zone: Primary Actions */}
                    <nav className="navbar-nav">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="prisma-nav-login-link">
                                    Dashboard
                                </Link>
                                <div className="navbar-user">
                                    <div className="user-avatar-badge">
                                        {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {user.email}
                                    </span>
                                </div>
                                <Link to="/change-password" className="prisma-nav-login-link" title="Security Settings">
                                    Settings
                                </Link>
                                <button onClick={handleLogout} className="prisma-nav-login-link" style={{ cursor: "pointer", background: "none" }}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="prisma-nav-login-link">
                                    Sign In
                                </Link>
                                <Link to="/register" className="prisma-nav-cta-btn">
                                    <span>Launch Room</span>
                                    <span style={{ fontSize: "14px" }}>→</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
            )}

            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Outlet />
            </main>

            {!isRoomPage && !isLandingPage && (
                <footer style={{ 
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)", 
                    background: "#000000", 
                    padding: isAuthPage ? "24px 32px" : "60px 32px 36px" 
                }}>
                    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
                        {/* Selected 4-column multi-problem/infrastructure grid is removed from auth/login pages */}
                        {!isAuthPage && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px", marginBottom: "48px" }}>
                                {/* Brand & Purpose */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#DEDBC8", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, fontFamily: "JetBrains Mono" }}>
                                            &lt;/&gt;
                                        </div>
                                        <span style={{ fontSize: "18px", fontWeight: 700, color: "#E1E0CC", letterSpacing: "-0.03em" }}>CodeSync</span>
                                        <span style={{ color: "#DEDBC8", fontWeight: 700 }}>*</span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.6, maxWidth: "300px" }}>
                                        Mission control for competitive programming teams. Real-time sub-50ms editor sync, multi-problem triage, and zero-latency sample judging.
                                    </p>
                                </div>

                                {/* Contest Workflow */}
                                <div>
                                    <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#DEDBC8", fontWeight: 600, marginBottom: "16px" }}>
                                        Contest Workflow
                                    </h4>
                                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "rgba(225, 224, 204, 0.75)" }}>
                                        <li><Link to="/#showcase" style={{ color: "inherit", textDecoration: "none" }}>01. Monaco IDE Sync</Link></li>
                                        <li><Link to="/#showcase" style={{ color: "inherit", textDecoration: "none" }}>02. Multi-Problem Triage</Link></li>
                                        <li><Link to="/#showcase" style={{ color: "inherit", textDecoration: "none" }}>03. Sample Runner & Diff</Link></li>
                                        <li><Link to="/#showcase" style={{ color: "inherit", textDecoration: "none" }}>04. Tactical Contest Chat</Link></li>
                                    </ul>
                                </div>

                                {/* Sandboxed Runtimes */}
                                <div>
                                    <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#DEDBC8", fontWeight: 600, marginBottom: "16px" }}>
                                        Sandboxed Runtimes
                                    </h4>
                                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "rgba(225, 224, 204, 0.75)", fontFamily: "JetBrains Mono" }}>
                                        <li>C++20 (GCC 13.2)</li>
                                        <li>Python 3.12 / PyPy3</li>
                                        <li>Java 21 LTS</li>
                                        <li>Rust 1.78 (Release)</li>
                                        <li>Go 1.22</li>
                                    </ul>
                                </div>

                                {/* Live Status & Security */}
                                <div>
                                    <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#DEDBC8", fontWeight: 600, marginBottom: "16px" }}>
                                        Live Infrastructure
                                    </h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "12px", fontFamily: "JetBrains Mono" }}>
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                            <span>All Sandbox Nodes Operational</span>
                                        </div>
                                        <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                                            Database: MongoDB Atlas Connected
                                        </span>
                                        <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                                            Sub-50ms Yjs CRDT WebSocket Cluster
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Copyright */}
                        <div style={{ 
                            borderTop: isAuthPage ? "none" : "1px solid rgba(255, 255, 255, 0.08)", 
                            paddingTop: isAuthPage ? "0" : "24px", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            flexWrap: "wrap", 
                            gap: "16px", 
                            fontSize: "12px", 
                            color: "#9CA3AF" 
                        }}>
                            <div>
                                © 2026 CodeSync. All rights reserved. Purpose-built for serious competitive programming teams.
                            </div>
                            <div style={{ color: "rgba(222, 219, 200, 0.6)" }}>
                                Designed with Prisma Visual Standards · Dark Moody Palette
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}

export default MainLayout;