import RegisterForm from "../components/RegisterForm";

function RegisterPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Join CodeSync</h2>
                    <p>Create your account and start collaborating with developers in real time.</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}

export default RegisterPage;