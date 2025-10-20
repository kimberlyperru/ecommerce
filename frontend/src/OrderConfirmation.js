import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api'; // Assuming you have a centralized api handler

function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch order details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return <p>Loading order details...</p>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!order) {
        return <p>Order not found.</p>;
    }

    const renderPaymentDetails = () => {
        switch (order.paymentMethod) {
            case 'bank_transfer':
                return (
                    <div className="alert alert-info">
                        <h5 className="alert-heading">Bank Transfer Instructions</h5>
                        <p>Your order has been placed. Please complete the payment using the details provided during checkout. Your submitted transaction ID is: <strong>{order.transactionId || 'Not provided'}</strong>.</p>
                        <p>The order will be processed once payment is confirmed.</p>
                    </div>
                );
            case 'mpesa':
                return <p>Your payment status is <strong>{order.paymentStatus}</strong>. You should have received an STK push on your phone.</p>;
            case 'paypal':
                return <p>Your payment status is <strong>{order.paymentStatus}</strong>.</p>;
            default:
                return null;
        }
    };

    return (
        <div className="container mt-4">
            <h2>Order Confirmation</h2>
            <p>Thank you for your purchase! Your order has been successfully placed.</p>

            <div className="card">
                <div className="card-header">
                    Order ID: {order._id}
                </div>
                <div className="card-body">
                    <h5 className="card-title">Order Summary</h5>
                    <ul className="list-group list-group-flush">
                        {order.items.map(item => (
                            <li key={item.product._id || item._id} className="list-group-item d-flex justify-content-between align-items-center">
                                {item.name} (x{item.quantity})
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                            Total Amount
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </li>
                    </ul>
                    <hr />
                    {renderPaymentDetails()}
                    <Link to="/" className="btn btn-primary mt-3">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmation;