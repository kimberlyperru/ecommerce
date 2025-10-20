const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

const auth = require('../middleware/auth');
const Order = require('../models/Order');
// Import M-Pesa helper functions from your mpesa.js route
// In a larger app, you might move these to a dedicated 'services' or 'utils' file.
const { getAccessToken, getTimestamp } = require('./mpesa-helpers');

/**
 * @route   POST /simple-ecom/checkout
 * @desc    Initiate payment process for the user's cart
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    const { paymentMethod, phone, transactionId } = req.body; // 'mpesa', 'paypal', 'bank_transfer'
    const userId = req.user;

    if (!paymentMethod) {
        return res.status(400).json({ message: 'Payment method is required.' });
    }

    try {
        // 1. Get user and populate cart with product details to calculate total
        const user = await User.findById(userId).populate({
            path: 'cart.product',
            model: 'Product'
        });

        if (!user || user.cart.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        // 2. Filter cart for valid (existing) products and calculate total
        const validCartItems = user.cart.filter(item => item.product);

        if (validCartItems.length === 0) {
            // This can happen if all products in the cart were deleted
            // It's good practice to clear the user's cart in this state
            user.cart = [];
            await user.save();
            return res.status(400).json({ message: 'Your cart contains no available products. It has been cleared.' });
        }

        const totalAmount = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        if (totalAmount <= 0) {
            return res.status(400).json({ message: 'Cannot process a payment for a zero or negative amount.' });
        }

        // 3. Prepare order data
        const newOrder = new Order({
            user: userId,
            items: validCartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            })),
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: 'pending',
            transactionId: paymentMethod === 'bank_transfer' ? transactionId : undefined
        });

        // 4. Handle payment based on the chosen method
        switch (paymentMethod) {
            case 'mpesa':
                if (!phone) {
                    return res.status(400).json({ message: 'Phone number is required for M-Pesa.' });
                }

                // --- Sanitize and format the phone number for M-Pesa ---
                let formattedPhone = phone.toString().trim();
                if (formattedPhone.startsWith('+')) {
                    formattedPhone = formattedPhone.substring(1); // Remove '+'
                }
                if (formattedPhone.startsWith('0')) {
                    formattedPhone = '254' + formattedPhone.substring(1); // Replace '0' with '254'
                }
                // Basic validation for the resulting number format
                if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
                    return res.status(400).json({ message: 'Invalid phone number format. Please use a valid Safaricom number (e.g., 0712345678).' });
                }

                // --- M-Pesa STK Push Logic (DEMO MODE) ---
                // In this demo mode, we'll simulate a successful payment directly
                // without calling the M-Pesa API.

                // 1. Mark the order as completed
                newOrder.paymentStatus = 'completed';
                newOrder.transactionId = `demo_${Date.now()}`; // Create a dummy transaction ID

                // 2. Save the order
                await newOrder.save();

                // 3. Clear the user's cart
                user.cart = [];
                await user.save();

                // 4. Return a success response
                return res.status(200).json({
                    message: 'Payment successful! Thank you for your purchase.',
                    orderId: newOrder._id
                });

            case 'paypal':
                // --- PayPal Logic (DEMO) ---
                // In a real integration, you would use the PayPal REST API to create a payment order.
                await newOrder.save();

                // Clear the user's cart after successful order creation
                user.cart = [];
                await user.save();

                // This would return a redirect URL for the user to complete payment.
                return res.status(200).json({
                    // The order is saved before this response
                    message: 'PayPal payment initiated (DEMO).',
                    orderId: newOrder._id,
                    // In a real scenario, you'd get this from the PayPal API
                    redirectUrl: `https://www.sandbox.paypal.com/checkoutnow?token=demo-token-for-order-${Date.now()}`
                });

            case 'bank_transfer':
                // --- Bank Transfer Logic (DEMO) ---
                // Return your bank details for the user to make a manual payment.
                await newOrder.save();

                // Clear the user's cart after successful order creation
                user.cart = [];
                await user.save();

                return res.status(200).json({
                    message: 'Please use the details below to complete your payment.',
                    orderId: newOrder._id,
                    instructions: 'After payment, please send the receipt to payments@example.com with your order ID.',
                    bankDetails: {
                        bankName: 'Equity Bank',
                        accountName: 'E-commerce Web App Inc.',
                        accountNumber: '123-456-789012'
                    }
                });

            default:
                return res.status(400).json({ message: 'Invalid payment method selected.' });
        }
    } catch (error) {
        console.error('Checkout Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'An error occurred during the checkout process.' });
    }
});

module.exports = router;
