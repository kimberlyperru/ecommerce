const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['mpesa', 'paypal', 'bank_transfer']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: { // Stores M-Pesa CheckoutRequestID, PayPal Order ID, or Bank Transaction ID
        type: String
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('Order', OrderSchema);