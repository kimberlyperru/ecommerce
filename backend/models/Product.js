//Import mongoose
const mongoose = require('mongoose');

//Define the Product schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
});

//Create the Product model from the schema
const Product = mongoose.model('Product', productSchema);

//Export the Product model
module.exports = Product;
//module.exports = mongoose.model('Product', productSchema); (alternative export method)
