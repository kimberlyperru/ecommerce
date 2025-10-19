const mongoose = require('mongoose');

// --- User Model Definition ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }
    ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;