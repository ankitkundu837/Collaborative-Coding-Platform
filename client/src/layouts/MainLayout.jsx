import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { logout } from "../services/authService";

function MainLayout() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { success } = useToast();

    // Check if currently inside a room editor view to maximize screen space
    const isRoomPage = location.pathname.startsWith("/room/");

    function handleLogout() {
        logout();
        setUser(null);
        success("Logged out successfully");
        navigate("/login");
    }

    return (
        <div className="app-wrapper">
            {!isRoomPage && (
                <header className="navbar">
                    <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
                        <div className="navbar-logo-icon">&lt;/&gt;</div>
                        <span>CodeSync</span>
                    </Link>

                    <nav className="navbar-nav">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                                    Dashboard
                                </Link>
                                <div className="navbar-user">
                                    <div className="user-avatar-badge">
                                        {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <span>{user.email}</span>
                                </div>
                                <Link to="/change-password" className="btn btn-secondary btn-sm" title="Security Settings">
                                    ⚙ Settings
                                </Link>
                                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
            )}

            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Outlet />
            </main>

            {!isRoomPage && (
                <footer className="footer">
                    <p>© {new Date().getFullYear()} CodeSync. Production-grade Real-Time Collaborative Coding Environment.</p>
                </footer>
            )}
        </div>
    );
}

export default MainLayout;