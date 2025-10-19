// src/App.js
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Login from "./Login";
import Register from "./Register";
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import Cart from './Cart';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [editingProduct, setEditingProduct] = useState(null); // To hold the product being edited
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [view, setView] = useState('products'); // 'products' or 'cart'

  const getUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return jwtDecode(token).userId;
    } catch (e) {
      return null;
    }
  };

  const [currentUserId, setCurrentUserId] = useState(getUserId());

  // Check for token on initial load to persist login state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setCurrentUserId(getUserId());
    } else {
      // For guest users, load cart from localStorage
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
    }
  }, []);

  // Update cart in localStorage for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch Products for all users
    axios
      .get("http://localhost:5000/simple-ecom/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setProducts([]);
        } else {
          console.log(err);
        }
      });

    if (isLoggedIn) {
      // Fetch Cart
      const token = localStorage.getItem("token");
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

      if (localCart.length > 0) {
        // Sync local cart with backend
        axios.post("http://localhost:5000/simple-ecom/cart/sync", { cart: localCart }, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          setCartItems(res.data);
          localStorage.removeItem('cart'); // Clear local cart after syncing
        }).catch(err => console.error("Failed to sync cart", err));
      } else {
        // Fetch cart from backend
      axios.get("http://localhost:5000/simple-ecom/cart", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setCartItems(res.data))
        .catch(err => {
          if (err.response && err.response.status === 404) {
            setCartItems([]); // Cart is empty for new user, this is fine.
          } else {
            console.error("Failed to fetch cart", err);
          }
        });
      }
    }
  }, [isLoggedIn]); // Re-fetch products if login state changes

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission for both adding and updating
  const handleSubmit = () => {
    if (editingProduct) {
      updateProduct();
    } else {
      addProduct();
    }
  };

  // Add a new product
  const addProduct = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.description.trim()) {
      alert("Please fill in all fields before adding a product.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:5000/simple-ecom/products", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Add the new product to the state without reloading
      setProducts([...products, res.data.product]);
      setForm({ name: "", price: "", description: "" }); // Clear form
      alert("Product added!");
    } catch (err) {
      console.error(err);
      alert("Failed to add product. You might not be authorized.");
    }
  };

  // Update an existing product
  const updateProduct = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`http://localhost:5000/simple-ecom/products/${editingProduct._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update the product in the state
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? res.data.product : p
        )
      );
      setEditingProduct(null); // Exit editing mode
      setForm({ name: "", price: "", description: "" }); // Clear form
      alert("Product updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update product.");
    }
  };

  // Delete product
  const deleteProduct = (productId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:5000/simple-ecom/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        // Remove the deleted product from the state without reloading
        setProducts(products.filter((p) => p._id !== productId));
        alert("Product deleted!");
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to delete product. You might not be authorized.");
      });
  };

  // --- Cart Functions ---

  const addToCart = async (productId) => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.post("http://localhost:5000/simple-ecom/cart/add",
          { productId, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(res.data);
        alert("Item added to cart!");
      } catch (error) {
        console.error("Failed to add to cart", error);
        alert("Could not add item to cart.");
      }
    } else {
      // Handle guest cart in localStorage
      const productToAdd = products.find(p => p._id === productId);
      if (!productToAdd) return;

      const existingItem = cartItems.find(item => item.product._id === productId);
        if (existingItem) {
        setCartItems(cartItems.map(item => item.product._id === productId ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        setCartItems([...cartItems, { product: productToAdd, quantity: 1 }]);
      }
      alert("Item added to cart!");
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    const newQuantity = parseInt(quantity, 10);

    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.post("http://localhost:5000/simple-ecom/cart/update",
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartItems(res.data);
      } catch (error) {
        console.error("Failed to update cart quantity", error);
        alert("Could not update item quantity.");
      }
    } else {
      // Handle guest cart in localStorage
      if (newQuantity > 0) {
        setCartItems(cartItems.map(item => item.product._id === productId ? { ...item, quantity: newQuantity } : item));
      } else {
        setCartItems(cartItems.filter(item => item.product._id !== productId));
      }
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:5000/simple-ecom/cart/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data);
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  };

  const checkout = async () => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.post("http://localhost:5000/simple-ecom/cart/checkout", {}, { headers: { Authorization: `Bearer ${token}` } });
        alert(res.data.message);
        setCartItems([]);
      } catch (error) {
        console.error("Checkout failed", error);
        alert("Checkout failed. Please try again.");
      }
    } else {
      // For guests, prompt to log in or register
      alert("Please log in or register to complete your purchase.");
      setShowRegister(false); // Or direct to login
    }

  };

  // Set up the form for editing a product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm(product);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProduct(null);
    setForm({ name: "", price: "", description: "" });
  };

   //sign in and login conditions
  if (!isLoggedIn && view !== 'products' && view !== 'cart') {
    return (
      <div className="container mt-5">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setCurrentUserId(getUserId());
              setView('products');
            }}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  const handleLoginClick = () => {
    setView('login');
    setShowRegister(false);
  }

  return (
    <div className="container mt-4">
      <nav className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
        <h2 className="mb-0">🛍️ Simple E-commerce Demo</h2>
        <div>
          <button className="btn btn-info me-2" onClick={() => setView(view === 'cart' ? 'products' : 'cart')}>
            {view === 'cart' ? 'View Products' : `View Cart (${cartItems.reduce((sum, item) => sum + item.quantity, 0)})`}
          </button>
          {isLoggedIn ? (
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setCurrentUserId(null);
                setCartItems([]); // Clear cart on logout
                setView('products');
                localStorage.removeItem('cart');
              }}
            >
              Logout
            </button>
          ) : (
            <button className="btn btn-outline-primary" onClick={handleLoginClick}>Login</button>
          )}
        </div>
      </nav>

      <hr />

      {view === 'products' ? (
        <>
          <ProductForm form={form} editingProduct={editingProduct} onFormChange={handleChange} onSubmit={handleSubmit} onCancelEdit={cancelEdit} />
          <ProductList products={products} onEdit={handleEdit} onDelete={deleteProduct} onAddToCart={addToCart} currentUserId={currentUserId} />
        </>
      ) : (
        <Cart cartItems={cartItems} onUpdateQuantity={updateCartQuantity} onRemoveFromCart={removeFromCart} onCheckout={checkout} />
      )}
    </div>
  );
}

export default App;
