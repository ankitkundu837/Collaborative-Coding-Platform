import LoginForm from "../components/LoginForm";

function LoginPage() {
    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your collaborative coding workspaces.</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}

export default LoginPage;