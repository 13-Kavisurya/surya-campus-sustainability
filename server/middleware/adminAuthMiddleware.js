const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user is an admin in the unified users collection
            const admin = await User.findById(decoded.id).select('-password');
            
            if (!admin || admin.user_type !== 'admin') {
                return res.status(401).json({ message: 'Not authorized, admin access required' });
            }
            
            req.admin = admin; // Attach admin to request
            return next();
        } catch (error) {
            console.error('Admin Auth Error:', error);
            return res.status(401).json({ message: 'Not authorized, admin token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no admin token' });
    }
};

module.exports = { protectAdmin };
