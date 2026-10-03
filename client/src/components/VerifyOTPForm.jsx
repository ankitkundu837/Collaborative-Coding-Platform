import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOTP, resendOTP } from "../services/authService";
import { useToast } from "../hooks/useToast";

function VerifyOTPForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { success, error: showError } = useToast();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOTP] = useState(location.state?.devOtp || "");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !otp.trim()) {
            showError("Please enter your email and 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const data = await verifyOTP({
                email: email.trim(),
                otp: otp.trim()
            });

            success(data.message || "Email verified successfully! You can now log in.");
            navigate("/login");
        } catch (err) {
            showError(err.response?.data?.message || "OTP verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (!email.trim()) {
            showError("Please enter your email address first");
            return;
        }

        if (cooldown > 0 || resending) return;

        setResending(true);

        try {
            const data = await resendOTP({ email: email.trim() });
            if (data.devOtp) {
                setOTP(data.devOtp);
            }
            success(data.message || "A fresh verification code has been sent to your email!");
            setCooldown(30);
        } catch (err) {
            showError(err.response?.data?.message || "Failed to resend code. Please try again.");
        } finally {
            setResending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="otp-email">Email Address</label>
                <input
                    id="otp-email"
                    className="input-field"
                    type="email"
                    placeholder="alex@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="input-label" htmlFor="otp-code" style={{ margin: 0 }}>6-Digit Verification Code</label>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: cooldown > 0 ? "var(--text-dim)" : "var(--accent-primary)",
                            fontSize: "12px",
                            cursor: cooldown > 0 ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            padding: 0
                        }}
                    >
                        {resending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                    </button>
                </div>
                <input
                    id="otp-code"
                    className="input-field"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    required
                    style={{ letterSpacing: "4px", fontSize: "18px", textAlign: "center", fontWeight: 700 }}
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, ""))}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
            >
                {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner-sm"></span>
                        <span>Verifying...</span>
                    </span>
                ) : (
                    "Verify & Activate Account"
                )}
            </button>

            <div className="auth-footer-links">
                <p>
                    Wrong email?{" "}
                    <Link to="/register" style={{ fontWeight: 600 }}>
                        Register again
                    </Link>
                </p>
                <p>
                    <Link to="/login">
                        Back to Login
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default VerifyOTPForm;