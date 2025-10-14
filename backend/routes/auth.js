//handle user registration and login
const express = require('express'); //import express module
const router = express.Router(); //create router instance to define router
const bcrypt = require('bcryptjs'); //import bcrypt for hashing passwords
const jwt = require('jsonwebtoken'); //import jsonwebtoken for token generation
const User = require('../models/User'); //import User model 

//secret key for JWT/signing token(demo)
const SECRET = "secretkey123";

//Register Route
router.post('/register', async (req, res) => {
    try {
        // Get user details from frontend form(request body)
        const { username, password } = req.body;

        //Hashing password before storing in DB
        const hashedPassword = await bcrypt.hash(password, 10); //10 is salt rounds

        // Create new user and save to MongoDB
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        // Send success response
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ message: "Registration failed" });
    }
});

//Login Route
router.post('/login', async (req, res) => {
    try {
        // Get login details from frontend form(request body)
        const { username, password } = req.body;
        // Find user in DB by username
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong Password" });

        // Generate JWT token on successful login
        const token = jwt.sign({ userId: user._id }, SECRET,); //{ expiresIn: '1h' } can be added for token expiry
        res.json({message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});    

// Export router to be used in main server file
module.exports = router;