import { Link } from "react-router-dom";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

function ForgotPasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your team email address and we'll send you an OTP code to reset your password.</p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
