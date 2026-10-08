import { Link } from "react-router-dom";
import VerifyOTPForm from "../components/VerifyOTPForm";

function VerifyOTPPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Verify Your Email</h2>
                    <p>Enter the 6-digit verification code sent to your email to activate your account.</p>
                </div>
                <VerifyOTPForm />
            </div>
        </div>
    );
}

export default VerifyOTPPage;
