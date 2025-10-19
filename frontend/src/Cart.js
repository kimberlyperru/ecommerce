import React from 'react';

function Cart({ cartItems, onUpdateQuantity, onRemoveFromCart, onCheckout }) {
    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h3 className="card-title">🛒 Your Cart</h3>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <ul className="list-group mb-3">
                            {cartItems.map(item => (
                                 <li key={item.product._id} className="list-group-item d-flex justify-content-between align-items-center">
                                     <div>
                                         <b>{item.product.name}</b>
                                         <input
                                             type="number"
                                             className="form-control form-control-sm d-inline-block mx-2"
                                             style={{ width: '60px' }}
                                             value={item.quantity}
                                             onChange={(e) => onUpdateQuantity(item.product._id, e.target.value)}
                                             min="0" />
                                     </div>
                                     <div>
                                         <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                         <button onClick={() => onRemoveFromCart(item.product._id)} className="btn btn-sm btn-outline-danger ms-3">Remove</button>
                                     </div>
                                 </li>
                            ))}
                        </ul>
                        <h5>Total: ${total.toFixed(2)}</h5>
                        <button onClick={onCheckout} className="btn btn-success w-100">Checkout</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;