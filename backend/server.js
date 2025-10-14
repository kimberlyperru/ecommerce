//import modules for our ecommerce backend
const express = require('express'); //the server framework
const mongoose = require('mongoose'); //to interact with MongoDB
const bodyParser = require('body-parser'); //to parse incoming request bodies
const cors = require('cors'); //to handle Cross-Origin Request Sharing

//initialize the express app
const app = express();

//middleware setup
app.use(bodyParser.json()); //parse JSON request bodies
app.use(cors()); //enable CORS(cross-origin resource sharing) for all routes

//connect to MongoDB
//Make sure MongoDB is running locally or in MongoDB Atlas
mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

//import routes for products and users
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

//use routes
app.use('/simple-ecom/products', productRoutes); //all product routes will be prefixed with /simple-ecom/products
app.use('/simple-ecom/auth', authRoutes); 

//start the server
app.listen(5000, () => {
    console.log('Ecommerce backend server is running on http://localhost:5000');
});


