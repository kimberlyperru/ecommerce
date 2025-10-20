// src/App.js
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Login from "./Login";
import Register from "./Register";
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import Cart from './Cart';
import api from './api';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [editingProduct, setEditingProduct] = useState(null); // To hold the product being edited
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [view, setView] = useState('products'); // 'products' or 'cart'
  const [pollingIntervalId, setPollingIntervalId] = useState(null);

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

    // Cleanup polling on component unmount
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };

  }, [pollingIntervalId]);

  // Update cart in localStorage for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch Products for all users
    api.get("/products")
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
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

      if (localCart.length > 0) {
        // Sync local cart with backend
        api.post("/cart/sync", { cart: localCart }).then(res => {
          setCartItems(res.data);
          localStorage.removeItem('cart'); // Clear local cart after syncing
        }).catch(err => console.error("Failed to sync cart", err));
      } else {
        // Fetch cart from backend
      api.get("/cart").then(res => setCartItems(res.data))
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
    try {
      const res = await api.post("/products", form);
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
    try {
      const res = await api.put(`/products/${editingProduct._id}`, form);
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
    api
      .delete(`/products/${productId}`)
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
      try {
        const res = await api.post("/cart/add", { productId, quantity: 1 });
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
    // Prevent non-numeric or negative values other than 0 for removal
    if (isNaN(newQuantity) || newQuantity < 0) {
      return;
    }

    if (isLoggedIn) {
      try {
        const res = await api.post("/cart/update", { productId, quantity: newQuantity });
        setCartItems(res.data);
      } catch (error) {
        console.error("Failed to update cart quantity", error);
        alert("Could not update item quantity.");
      }
    } else {
      if (newQuantity > 0) {
        setCartItems(cartItems.map(item => item.product._id === productId ? { ...item, quantity: newQuantity } : item));
      } else {
        // If quantity is 0, remove the item for guests as well
        setCartItems(cartItems.filter(item => item.product._id !== productId));
      }
    }
  };

  const removeFromCart = async (productId) => {
    if (isLoggedIn) {
      try {
        const res = await api.post("/cart/remove", { productId });
        setCartItems(res.data);
      } catch (error) {
        console.error("Failed to remove from cart", error);
      }
    } else {
      // Handle guest cart removal from localStorage
      setCartItems(cartItems.filter(item => item.product._id !== productId));
    }
  };

  const pollForCartClearance = () => {
    const intervalId = setInterval(async () => {
      try {
        const res = await api.get("/cart");
        if (res.data.length === 0) {
          clearInterval(intervalId);
          setPollingIntervalId(null);
          setCartItems([]);
          alert("M-Pesa payment successful! Your cart has been cleared.");
          setView('products'); // Switch back to products view
        }
      } catch (error) {
        console.error("Polling for cart clearance failed:", error);
        clearInterval(intervalId); // Stop polling on error
        setPollingIntervalId(null);
      }
    }, 5000); // Poll every 5 seconds

    setPollingIntervalId(intervalId);
  };

  const handleCheckout = async (paymentDetails) => {
    if (!isLoggedIn) {
      alert("Please log in or register to complete your purchase.");
      handleLoginClick();
      return;
    }

    try {
      const res = await api.post("/checkout", paymentDetails);

      if (paymentDetails.paymentMethod === 'mpesa') {
        alert("M-Pesa payment initiated. Please check your phone to complete the transaction. We will notify you upon completion.");
        setView('products'); // Move user away from cart
        pollForCartClearance(); // Start polling for cart update
      } else if (paymentDetails.paymentMethod === 'bank_transfer' || paymentDetails.paymentMethod === 'paypal') {
        // This part assumes you will implement the redirection to an order confirmation page
        alert(res.data.message || "Order placed successfully!");
        setCartItems([]); // Clear cart immediately for these methods
        setView('products');
        // Ideally, you would navigate to the order confirmation page here:
        // navigate(`/order-confirmation/${res.data.orderId}`);
      }

    } catch (error) {
      console.error("Checkout failed", error);
      const errorMessage = error.response?.data?.message || "Checkout failed. Please try again.";
      alert(errorMessage);
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId); // Stop polling if checkout fails
      }
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
        <Cart cartItems={cartItems} onUpdateQuantity={updateCartQuantity} onRemoveItem={removeFromCart} onCheckout={handleCheckout} />
      )}
    </div>
  );
}

export default App;
