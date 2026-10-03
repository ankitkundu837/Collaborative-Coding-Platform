import ForgotPasswordForm from "../components/ForgotPasswordForm";

function ForgotPasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email address and we'll send you a link to reset your account password.</p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}

export default ForgotPasswordPage;