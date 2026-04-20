const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUser,
    deleteUser,
    createUser,
    getAllReports,
    deleteReport,
    getAnalytics,
    getAllUsage
} = require('../controllers/adminController');
const { 
    getAssignments, 
    updateAssignment, 
    getCoordinators 
} = require('../controllers/blockController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAdminToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Admin Auth Routes ──────────────────────────────────────────────────────
// Silent auto-login for localhost (dev convenience — no password needed)
router.get('/auth/auto-login', async (req, res) => {
    try {
        const admin = await User.findOne({ user_type: 'admin' });
        if (!admin) return res.status(404).json({ message: 'No admin account found. Run seedAdmin.js first.' });
        const token = generateAdminToken(admin._id);
        res.json({ _id: admin._id, name: admin.name, email: admin.email, user_type: admin.user_type, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Registration
router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Admin account with this email already exists' });

        const admin = await User.create({
            name,
            email,
            password,
            user_type: 'admin'
        });

        const token = generateAdminToken(admin._id);
        res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, user_type: admin.user_type, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Credential-based admin login
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await User.findOne({ email, user_type: 'admin' });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials or not an admin account' });
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = generateAdminToken(admin._id);
        res.json({ _id: admin._id, name: admin.name, email: admin.email, user_type: admin.user_type, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current admin profile (validates stored token)
router.get('/auth/profile', protectAdmin, (req, res) => {
    res.json(req.admin);
});

// User Management
router.route('/users')
    .get(protectAdmin, getUsers)
    .post(protectAdmin, createUser);

router.route('/users/:id')
    .put(protectAdmin, updateUser)
    .delete(protectAdmin, deleteUser);

// Report Management
router.route('/reports')
    .get(protectAdmin, getAllReports);

router.route('/reports/:id')
    .delete(protectAdmin, deleteReport);

// Usage Tracker
router.get('/usage', protectAdmin, getAllUsage);

// Dashboard Analytics
router.get('/analytics', protectAdmin, getAnalytics);

// Block Coordinator Assignments
router.route('/block-assignments')
    .get(protectAdmin, getAssignments)
    .post(protectAdmin, updateAssignment);

router.get('/coordinators', protectAdmin, getCoordinators);

module.exports = router;
