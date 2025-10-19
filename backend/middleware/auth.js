const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).send('Access denied. No token provided.');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}

module.exports = authMiddleware;