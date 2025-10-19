const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User'); // Import the User model

const populateCart = {
    path: 'cart.product',
    populate: {
        path: 'seller',
        select: 'username'
    }
};

const getPopulatedCart = (userId) => User.findById(userId).populate(populateCart);

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await getPopulatedCart(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add item to cart
router.post('/add', async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findById(req.user);
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            // If item exists, update quantity
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            // If item doesn't exist, add it
            user.cart.push({ product: productId, quantity });
        }
        await user.save();
        const populatedUser = await getPopulatedCart(req.user);
        res.status(200).json(populatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sync local cart with user's cart on login
router.post('/sync', async (req, res) => {
    const { cart: localCart } = req.body;
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        localCart.forEach(localItem => {
            const cartItemIndex = user.cart.findIndex(item => item.product.toString() === localItem.product._id);
            if (cartItemIndex > -1) {
                user.cart[cartItemIndex].quantity += localItem.quantity;
            } else {
                user.cart.push({ product: localItem.product._id, quantity: localItem.quantity });
            }
        });

        await user.save();
        const populatedUser = await getPopulatedCart(req.user);
        res.status(200).json(populatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update item quantity in cart
router.post('/update', async (req, res) => {
    const { productId, quantity } = req.body;

    // Ensure quantity is a positive integer
    if (!Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }

    try {
        const user = await User.findById(req.user);
        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            if (quantity > 0) {
                user.cart[cartItemIndex].quantity = quantity;
            } else {
                // Remove item if quantity is 0
                user.cart.splice(cartItemIndex, 1);
            }
            await user.save();
            const updatedUser = await getPopulatedCart(req.user);
            res.status(200).json(updatedUser.cart);
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove item from cart
router.post('/remove', async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.user);
        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();
        const updatedUser = await getPopulatedCart(req.user);
        res.status(200).json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Checkout (mock)
router.post('/checkout', async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (user.cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        // In a real app, you would process payment here.
        // For now, we'll just clear the cart.
        user.cart = [];
        await user.save();
        res.status(200).json({ message: "Checkout successful! Your order is on its way." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;