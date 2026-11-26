
import React, { useState } from "react";
import Register from "./Register";

function Login({ onLoginSuccess }) {
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password.");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", data.email);

            onLoginSuccess(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showRegister) {
        return (
            <Register
                onRegisterSuccess={() => setShowRegister(false)}
                onBackToLogin={() => setShowRegister(false)}
            />
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#08091F",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white"
        }}>
            <form onSubmit={handleLogin} style={{
                width: "350px",
                padding: "35px",
                background: "#11182E",
                border: "1px solid #263B60",
                borderRadius: "15px"
            }}>
                <h1 style={{ color: "#20D9FF", textAlign: "center" }}>
                    SPACE ODYSSEY
                </h1>

                <h2 style={{ textAlign: "center" }}>Pilot Login</h2>

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={inputStyle}
                />

                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={inputStyle}
                />

                {error && (
                    <p style={{ color: "#FF5C75" }}>{error}</p>
                )}

                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? "LOGGING IN..." : "LOGIN"}
                </button>

                <p style={{ textAlign: "center", marginTop: "20px" }}>
                    New pilot? Create your account below.
                </p>

                <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    style={{
                        ...buttonStyle,
                        background: "transparent",
                        border: "1px solid #20D9FF",
                        color: "#20D9FF"
                    }}
                >
                    CREATE NEW ACCOUNT
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "10px 0 20px",
    boxSizing: "border-box",
    background: "#080F25",
    color: "white",
    border: "1px solid #34476A",
    borderRadius: "6px"
};

const buttonStyle = {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(90deg, #A34DF5, #00D9F5)",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer"
};

export default Login;
