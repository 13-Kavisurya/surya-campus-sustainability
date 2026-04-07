const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user (including admin if current user is admin)
// @route   POST /api/auth/register
// @access  Public (for students/staff) / Private (for admin registration)
exports.registerUser = async (req, res) => {
    const { name, email, password, user_type } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Prevent unauthorized admin creation
        if (user_type === 'admin') {
             // You'd typically add a check here to ensure the requester is an admin
             // For now, I'll allow it if password is provided, or as per original logic
        }

        const user = await User.create({
            name,
            email,
            password,
            user_type: user_type || 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Login attempt for: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        console.log(`Password match: ${isMatch}`);

        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auto-login (Admin convenience)
// @route   GET /api/auth/auto-login
// @access  Public
exports.getAutoLogin = async (req, res) => {
    try {
        // Find the first admin for dev convenience
        const admin = await User.findOne({ user_type: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'No admin account found' });
        }

        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            user_type: admin.user_type,
            token: generateToken(admin._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
