import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

function LoginPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your competitive programming room.</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}

export default LoginPage;
