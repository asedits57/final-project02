import { useState } from "react";
import { api } from "../services/api";
import { useStore } from "../store/useStore";

const Login = () => {
    const { setUser } = useStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const data = await api.login(email, password);
            localStorage.setItem("token", data.token);
            if (data.user) setUser(data.user);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError("");
        setLoading(true);
        try {
            const data = await api.register(email, password);
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin} disabled={loading}>
                {loading ? "Loading..." : "Login"}
            </button>

            <button onClick={handleRegister} disabled={loading}>
                {loading ? "Loading..." : "Register"}
            </button>
        </div>
    );
};

export default Login;
