import ResetPasswordForm from "../components/ResetPasswordForm";

function ResetPasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Set New Password</h2>
                    <p>Enter your new password below to regain access to your account.</p>
                </div>
                <ResetPasswordForm />
            </div>
        </div>
    );
}

export default ResetPasswordPage;