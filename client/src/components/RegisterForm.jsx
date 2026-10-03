import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { useToast } from "../hooks/useToast";

function RegisterForm() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
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

        if (formData.password.length < 6) {
            showError("Password must be at least 6 characters long");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = await register({
                email: formData.email,
                password: formData.password
            });

            success(data.message || "Registration successful! Check your email for your verification code.");

            navigate("/verify-otp", {
                state: {
                    email: formData.email,
                    devOtp: data.devOtp
                }
            });
        } catch (err) {
            showError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="reg-email">Email Address</label>
                <input
                    id="reg-email"
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
                <label className="input-label" htmlFor="reg-password">Password (min 6 characters)</label>
                <input
                    id="reg-password"
                    className="input-field"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                    id="reg-confirm"
                    className="input-field"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                        <span>Creating Account...</span>
                    </span>
                ) : (
                    "Create Free Account"
                )}
            </button>

            <div className="auth-footer-links">
                <p>
                    Already have an account?{" "}
                    <Link to="/login" style={{ fontWeight: 600 }}>
                        Sign in instead
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default RegisterForm;