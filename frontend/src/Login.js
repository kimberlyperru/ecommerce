// src/Login.js
import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/simple-ecom/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      onLoginSuccess();
    } catch (err) {
      setError("Invalid name or password.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Sign In</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
      <p>
        Don’t have an account?{" "}
        <button onClick={onSwitchToRegister} style={styles.link}>
          Sign up
        </button>
      </p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    padding: "10px",
    width: "250px",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  link: {
    background: "none",
    border: "none",
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default Login;
