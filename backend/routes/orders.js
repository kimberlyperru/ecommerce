const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

/**
 * @route   GET /simple-ecom/orders/:id
 * @desc    Get a specific order by ID for the logged-in user
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Security check: Ensure the user requesting the order is the one who placed it
        if (order.user.toString() !== req.user) {
            return res.status(403).json({ message: 'Not authorized to view this order.' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        // Handle cases where the ID format is invalid (e.g., CastError)
        if (error.kind === 'ObjectId') { return res.status(404).json({ message: 'Order not found.' }); }
        res.status(500).json({ message: 'Server error while fetching order.' });
    }
});

module.exports = router;