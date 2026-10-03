import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { useToast } from "../hooks/useToast";

function ResetPasswordForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const { success, error: showError } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Missing Reset Token</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                    No valid password reset token was detected in the URL. Please click the full link sent to your email or request a new reset link.
                </p>
                <Link to="/forgot-password" className="btn btn-primary" style={{ width: "100%" }}>
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (password.length < 6) {
            showError("New password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = await resetPassword({
                token,
                password
            });

            success(data.message || "Password updated successfully! You can now log in.");
            navigate("/login");
        } catch (err) {
            showError(err.response?.data?.message || "Failed to reset password. Link may have expired.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="new-password">New Password (min 6 characters)</label>
                <input
                    id="new-password"
                    className="input-field"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                    id="confirm-new-password"
                    className="input-field"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
            >
                {loading ? "Updating Password..." : "Set New Password"}
            </button>

            <div className="auth-footer-links">
                <p>
                    <Link to="/login">
                        Back to Login
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default ResetPasswordForm;