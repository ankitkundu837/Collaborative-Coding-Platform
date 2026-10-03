import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import { useToast } from "../hooks/useToast";

function ForgotPasswordForm() {
    const { success, error: showError } = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await forgotPassword({ email: email.trim() });
            success(data.message || "Password reset link sent to your email.");
            setSubmitted(true);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to process password reset request.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📬</div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Check Your Inbox</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                    If an account is associated with <strong>{email}</strong>, we have sent a secure link to reset your password.
                </p>
                <Link to="/login" className="btn btn-secondary" style={{ width: "100%" }}>
                    Back to Sign In
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="forgot-email">Account Email</label>
                <input
                    id="forgot-email"
                    className="input-field"
                    type="email"
                    placeholder="alex@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
            >
                {loading ? "Sending Link..." : "Send Password Reset Link"}
            </button>

            <div className="auth-footer-links">
                <p>
                    Remember your password?{" "}
                    <Link to="/login" style={{ fontWeight: 600 }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default ForgotPasswordForm;