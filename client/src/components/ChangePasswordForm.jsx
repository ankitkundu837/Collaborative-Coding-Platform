import { useState } from "react";
import { changePassword } from "../services/authService";
import { useToast } from "../hooks/useToast";

function ChangePasswordForm() {
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (formData.newPassword.length < 6) {
            showError("New password must be at least 6 characters long");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            showError("New passwords do not match");
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            showError("New password must be different from current password");
            return;
        }

        setLoading(true);

        try {
            const data = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            success(data.message || "Password updated successfully!");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            showError(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="input-label" htmlFor="current-password">Current Password</label>
                <input
                    id="current-password"
                    className="input-field"
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    required
                    value={formData.currentPassword}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="change-new-password">New Password (min 6 characters)</label>
                <input
                    id="change-new-password"
                    className="input-field"
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label className="input-label" htmlFor="change-confirm-password">Confirm New Password</label>
                <input
                    id="change-confirm-password"
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
                {loading ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
}

export default ChangePasswordForm;