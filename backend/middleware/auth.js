const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate and protect routes.
 * It verifies the JWT token from the Authorization header.
 */
module.exports = function(req, res, next) {
    // 1. Get token from the header
    const authHeader = req.header('Authorization');

    // 2. Check if token exists
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // The token is expected to be in the format "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token format is invalid, authorization denied' });
        }

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId; // Add user ID from payload to request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};