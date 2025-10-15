// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  //fetch login in
  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get("http://localhost:5000/simple-ecom/products")
        .then((res) => setProducts(res.data))
        .catch((err) => console.log(err));
    }
  }, [isLoggedIn]);

  // Fetch all products when page loads
  useEffect(() => {
    axios
      .get("http://localhost:5000/simple-ecom/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add product
  const addProduct = () => {
    if (!form.name.trim() || !form.price.trim() || !form.description.trim()) {
      alert("Please fill in all fields before adding a product.");
      return;
    }
    axios
      .post("http://localhost:5000/simple-ecom/products", form)
      .then(() => {
        alert("Product added!");
        window.location.reload(); // refresh list
      });
  };

  // Delete product
  const deleteProduct = (productId) => {
    axios
      .delete(`http://localhost:5000/simple-ecom/products/${productId}`)
      .then(() => {
        alert("Product deleted!");
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };
   //sign in and login conditions
  if (!isLoggedIn) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login
        onLoginSuccess={() => setIsLoggedIn(true)}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <hr />

      {/* Product section */}
      <h2>🛍 Simple E-commerce Demo</h2>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
      >
        Logout
      </button>
      <div>
        <input name="name" placeholder="Product Name" onChange={handleChange} />
        <input name="price" placeholder="Price" onChange={handleChange} />
        <input name="description" placeholder="Description" onChange={handleChange} />
        <button onClick={addProduct}>Add Product</button>
      </div>

      <hr />

      <h3>All Products</h3>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            <b>{p.name}</b> - ${p.price} <br />
            <small>{p.description}</small>
            <button onClick={() => deleteProduct(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
