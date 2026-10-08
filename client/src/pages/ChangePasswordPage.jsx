import { Link } from "react-router-dom";
import ChangePasswordForm from "../components/ChangePasswordForm";

function ChangePasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Account Security</h2>
                    <p>Change your password to keep your competitive programming workspace secure.</p>
                </div>
                <ChangePasswordForm />
            </div>
        </div>
    );
}

export default ChangePasswordPage;
