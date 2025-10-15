// src/Register.js
import React, { useState } from "react";
import axios from "axios";

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/simple-ecom/auth/register", form);
      setMessage("✅ Registration successful! You can now log in.");
      setTimeout(onSwitchToLogin, 1500); // auto-switch after success
    } catch (err) {
      setMessage("❌ Error registering user. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🧍‍♂️ Create Account</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          name="username"
          placeholder="Fullname"
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
        <button type="submit" style={styles.button}>
          Sign Up
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <p>
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} style={styles.link}>
          Login
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
  link: {
    background: "none",
    border: "none",
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "green",
  },
};

export default Register;
