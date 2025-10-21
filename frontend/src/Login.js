// import necessary libraries
import React, { useState } from "react";
import axios from "axios";

// define the Login component
function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error on new input
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      // It's good practice to move the base URL to an environment variable
      // e.g., const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);
      const res = await axios.post("http://localhost:5000/simple-ecom/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setSuccessMessage("Login successful! Redirecting...");
      onLoginSuccess();
    } catch (err) {
      setError("Invalid name or password.");
    }
  };

  return (
    // Outer container with Bootstrap margin for spacing
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card p-4">
            <div className="card-body">
              <h2 className="text-center mb-4">🔐 Sign In</h2>
              <form onSubmit={handleLogin}>
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
                <button type="submit" className="btn btn-primary w-100">Login</button>
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
                {error && <p className="text-danger mt-3">{error}</p>}
              </form>
              <p className="mt-3 text-center">
                Don’t have an account?{" "}
                <button onClick={onSwitchToRegister} className="btn btn-link p-0">Sign up</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;