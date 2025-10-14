//product routes

//import necessary modules
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); //import the Product model

//create product
router.post('/', async (req, res) => {
    try {
        const { name, description, price  } = req.body;
        const product = new Product({ name, description, price });
        await product.save();
        res.status(200).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Product creation failed", error });
    }
});

/// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    // If NO PRODUCTS FOUND
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // If products exist, send them
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//Read/get one product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        // If PRODUCT NOT FOUND
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json( err);
    }
});

//update product by ID
router.put('/:id', async (req, res) => {
    try {
        //Fetch the record forom the form in the frontend
        const { name, description, price } = req.body;
        //update the product in the database
        await Product.findByIdAndUpdate(req.params.id, { name, description, price });
        //if product updated successfully
        res.status(200).json("Product updated successfully");
    } catch (error) {
        res.status(500).json(err);
    }
});

//delete product by ID
router.delete('/:id', async (req, res) => {
    try {
        //Get product ID from the URL and delete the product
        const product = await Product.findByIdAndDelete(req.params.id);
        // If PRODUCT NOT FOUND
        if (!product) {
            return res.status(404).json( "Product not found");
        }
        //if product deleted successfully
        res.status(200).json("Product deleted successfully");
    } catch (error) {
        res.status(500).json(err);
    }   
});

//export the router
module.exports = router;