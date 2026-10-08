import { Link } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";

function ResetPasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Set New Password</h2>
                    <p>Enter your verified code and new password to secure your account.</p>
                </div>
                <ResetPasswordForm />
            </div>
        </div>
    );
}

export default ResetPasswordPage;
