import { Link } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

function RegisterPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <Link to="/" className="auth-brand-badge">
                    <div className="badge-icon">&lt;/&gt;</div>
                    <span>CodeSync</span>
                    <span style={{ color: "#DEDBC8" }}>*</span>
                </Link>

                <div className="auth-header">
                    <h2>Join CodeSync</h2>
                    <p>Create your team account and start collaborating in live contest rooms.</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}

export default RegisterPage;
