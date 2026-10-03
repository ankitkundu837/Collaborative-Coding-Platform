import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { saveToken, saveUser } from "../utils/auth";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { connectSocket } from "../socket/socket";

function LoginForm() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login(formData);
            saveToken(data.token);
            saveUser(data.user);
            setUser(data.user);

            // Connect socket with newly minted token
            connectSocket(data.token);

            success("Welcome back! Login successful.");
            navigate("/dashboard");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
            showError(errorMsg);

            // If account needs email verification, redirect with email state
            if (err.response?.data?.needsVerification) {
                setTimeout(() => {
                    navigate("/verify-otp", { state: { email: formData.email } });
                }, 1500);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <input
                    id="login-email"
                    className="input-field"
                    type="email"
                    name="email"
                    placeholder="alex@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="input-label" htmlFor="login-password">Password</label>
                    <Link to="/forgot-password" style={{ fontSize: "12px" }}>
                        Forgot password?
                    </Link>
                </div>
                <input
                    id="login-password"
                    className="input-field"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
            >
                {loading ? "Signing in..." : "Sign In to CodeSync"}
            </button>

            <div className="auth-footer-links">
                <p>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ fontWeight: 600 }}>
                        Create one now
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default LoginForm;