import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * A component to display the shopping cart and handle the checkout process.
 */
function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [phone, setPhone] = useState('');
    const [bankTransactionId, setBankTransactionId] = useState('');

    // useMemo will prevent recalculating the total on every render, only when cartItems changes.
    const totalAmount = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            // Ensure product and price exist before calculating
            if (item.product && typeof item.product.price === 'number') {
                return sum + item.product.price * item.quantity;
            }
            return sum;
        }, 0).toFixed(2);
    }, [cartItems]);

    const handleCheckout = (e) => {
        e.preventDefault();
        // Basic validation before calling the checkout handler
        if (paymentMethod === 'mpesa' && !/^(254|0)\d{9}$/.test(phone)) {
            alert('Please enter a valid phone number (e.g., 254712345678) for M-Pesa.');
            return;
        }
        onCheckout({ paymentMethod, phone, transactionId: bankTransactionId });
    };

    return (
        <div>
            <h3>Shopping Cart</h3>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul className="list-group mb-3">
                        {cartItems.map(item => (
                            <li key={item.product._id} className="list-group-item d-flex justify-content-between lh-sm">
                                <div>
                                    <h6 className="my-0">{item.product.name}</h6>
                                    <small className="text-muted">Price: ${item.product.price.toFixed(2)}</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateQuantity(item.product._id, parseInt(e.target.value, 10))}
                                        className="form-control form-control-sm"
                                        style={{ width: '60px', textAlign: 'center' }}
                                        min="1"
                                    />
                                    <button onClick={() => onRemoveItem(item.product._id)} className="btn btn-sm btn-outline-danger ms-2">Remove</button>
                                </div>
                            </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Total (USD)</span>
                            <strong>${totalAmount}</strong>
                        </li>
                    </ul>

                    <h4>Checkout</h4>
                    <form onSubmit={handleCheckout}>
                        <div className="my-3">
                            <div className="form-check">
                                <input id="mpesa" name="paymentMethod" type="radio" className="form-check-input" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={(e) => setPaymentMethod(e.target.value)} required />
                                <label className="form-check-label" htmlFor="mpesa">M-Pesa</label>
                            </div>
                            <div className="form-check">
                                <input id="paypal" name="paymentMethod" type="radio" className="form-check-input" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} required />
                                <label className="form-check-label" htmlFor="paypal">PayPal</label>
                            </div>
                            <div className="form-check">
                                <input id="bank" name="paymentMethod" type="radio" className="form-check-input" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} required />
                                <label className="form-check-label" htmlFor="bank">Bank Transfer</label>
                            </div>
                        </div>

                        {paymentMethod === 'mpesa' && (
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">M-Pesa Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g., 254712345678"
                                    required
                                />
                            </div>
                        )}

                        {paymentMethod === 'bank_transfer' && (
                            <div className="mb-3">
                                <label htmlFor="bankTransactionId" className="form-label">Bank Transaction ID</label>
                                <input
                                    type="text"
                                    id="bankTransactionId"
                                    className="form-control"
                                    value={bankTransactionId}
                                    onChange={(e) => setBankTransactionId(e.target.value)}
                                    placeholder="Enter the transaction ID from your bank"
                                    required
                                />
                            </div>
                        )}

                        <hr className="my-4" />

                        <button className="w-100 btn btn-primary btn-lg" type="submit">
                            Proceed to Checkout
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

Cart.propTypes = {
    cartItems: PropTypes.arrayOf(PropTypes.shape({
        product: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
        }).isRequired,
        quantity: PropTypes.number.isRequired,
    })).isRequired,
    onUpdateQuantity: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
    onCheckout: PropTypes.func.isRequired,
};

export default Cart;