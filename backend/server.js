//import modules for our ecommerce backend
const express = require('express'); //the server framework
const mongoose = require('mongoose'); //to interact with MongoDB
const cors = require('cors'); //to handle Cross-Origin Resource Sharing
require('dotenv').config(); // Load environment variables

//initialize the express app
const app = express();

//middleware setup
app.use(express.json()); //parse JSON request bodies

// For production, you should restrict the origin to your frontend's domain
// For development, explicitly allow your React app's origin.
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigins,
    credentials: true // Allow cookies and authorization headers
}));

//connect to MongoDB
//Make sure MongoDB is running locally or in MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

//import routes for products and users
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const mpesaRoutes = require('./routes/mpesa');
const orderRoutes = require('./routes/orders');
const authMiddleware = require('./middleware/auth'); // Import the auth middleware
const checkoutRoutes = require('./routes/checkout');

//use routes
app.use('/simple-ecom/products', productRoutes); // GET routes are public
app.use('/simple-ecom/auth', authRoutes); // Auth routes (login/register)
app.use('/simple-ecom/orders', authMiddleware, orderRoutes); // Protect all order routes
app.use('/simple-ecom/cart', authMiddleware, cartRoutes); // Protect all cart routes
app.use('/simple-ecom/checkout', authMiddleware, checkoutRoutes); // Protect all checkout/payment routes
app.use('/simple-ecom/mpesa', mpesaRoutes); // M-Pesa payment routes

//start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Ecommerce backend server is running on http://localhost:${PORT}`);
});
