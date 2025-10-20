const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const User = require('../models/User');
// No longer need authMiddleware or helpers here, as the initiation is done in checkout.js

/**
 * @route   POST /simple-ecom/mpesa/callback
 * @desc    M-Pesa callback URL for payment status
 * @access  Public
 */
router.post('/callback', async (req, res) => {
    console.log('--- M-Pesa Callback Received ---');
    const callbackData = req.body;
    console.log(JSON.stringify(callbackData, null, 2));

    // Acknowledge receipt of the callback immediately
    res.status(200).json({ message: 'Callback received successfully.' });

    // Process the callback data
    const body = callbackData.Body && callbackData.Body.stkCallback;
    if (!body) {
        console.error('Invalid M-Pesa callback format received.');
        return;
    }

    const checkoutRequestId = body.CheckoutRequestID;
    const resultCode = body.ResultCode;

    try {
        // Find the order using the CheckoutRequestID
        const order = await Order.findOne({ transactionId: checkoutRequestId });

        if (!order) {
            console.error(`Order not found for CheckoutRequestID: ${checkoutRequestId}`);
            return;
        }

        if (resultCode === 0) {
            // Payment was successful
            order.paymentStatus = 'completed';
            await order.save();
            console.log(`Order ${order._id} marked as completed.`);

            // Clear the user's cart
            await User.updateOne({ _id: order.user }, { $set: { cart: [] } });
            console.log(`Cart cleared for user ${order.user}.`);
        } else {
            // Payment failed or was cancelled
            order.paymentStatus = 'failed';
            await order.save();
            console.log(`Order ${order._id} marked as failed. Reason: ${body.ResultDesc}`);
        }
    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);
    }
});

module.exports = router;