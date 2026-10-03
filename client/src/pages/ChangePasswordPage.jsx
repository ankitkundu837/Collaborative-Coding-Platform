import ChangePasswordForm from "../components/ChangePasswordForm";

function ChangePasswordPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Account Security</h2>
                    <p>Change your password to keep your collaborative account secure.</p>
                </div>
                <ChangePasswordForm />
            </div>
        </div>
    );
}

export default ChangePasswordPage;