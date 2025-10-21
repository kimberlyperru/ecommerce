//product routes
//import necessary modules
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Product model
const authMiddleware = require('../middleware/auth'); // Import the auth middleware

//create product
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, price  } = req.body;
        const product = new Product({ name, description, price, seller: req.user });
        await product.save();
        const populatedProduct = await product.populate('seller', 'username'); // Populating here is good
        res.status(201).json({ message: "Product created successfully", product: populatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Product creation failed", error });
    }
});

/// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'username');

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
        res.status(500).json({ message: error.message });
    }
});

//update product by ID
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        //Fetch the record forom the form in the frontend
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check if the logged-in user is the seller
        if (product.seller.toString() !== req.user) {
            return res.status(403).json({ message: "User not authorized to update this product" });
        }

        const { name, description, price } = req.body;
        // Update the product in the database and get the updated document
        let updatedProduct = await Product.findByIdAndUpdate(req.params.id, { name, description, price }, { new: true });
        
        //if product updated successfully
        updatedProduct = await updatedProduct.populate('seller', 'username');
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

     //delete product by ID
     router.delete('/:id', authMiddleware, async (req, res) => {
     try {
        //Get product ID from the URL and delete the product
        const product = await Product.findById(req.params.id);
        // If PRODUCT NOT FOUND
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Check if the logged-in user is the seller
        if (product.seller.toString() !== req.user) {
            return res.status(403).json({ message: "User not authorized to delete this product" });
        }
        await Product.findByIdAndDelete(req.params.id);
        //if product deleted successfully
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
});

//export the router
module.exports = router;