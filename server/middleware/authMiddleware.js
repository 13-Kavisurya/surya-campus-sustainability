const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    // Skip auth for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from unified collection
            const currentUser = await User.findById(decoded.id).select('-password');
            if (currentUser) {
                req.user = currentUser;
            }

            if (!req.user) {
                console.warn(`Auth Warning: User not found for ID ${decoded.id}`);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            return next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn(`Auth Warning: No token provided for ${req.method} ${req.url}`);
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.user_type)) {
            return res.status(403).json({
                message: `User role ${req.user.user_type} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
