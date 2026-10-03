import VerifyOTPForm from "../components/VerifyOTPForm";

function VerifyOTPPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
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