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
      // It's good practice to move the base URL to an environment variable
      // e.g., await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);
      await axios.post("http://localhost:5000/simple-ecom/auth/register", form);
      setMessage("✅ Registration successful! You can now log in.");
      setTimeout(onSwitchToLogin, 1500); // auto-switch after success
    } catch (err) {
      setMessage("❌ Error registering user. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card p-4">
            <div className="card-body">
              <h2 className="text-center mb-4">🧍‍♂️ Create Account</h2>
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <input
                    name="username"
                    placeholder="Username"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Sign Up</button>
              </form>
              {message && <div className="alert alert-info mt-3">{message}</div>}
              <p className="mt-3 text-center">
                Already have an account?{" "}
                <button onClick={onSwitchToLogin} className="btn btn-link p-0">Login</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;