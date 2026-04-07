const User = require('../models/User');
const SustainabilityReport = require('../models/SustainabilityReport');

// --- USER MANAGEMENT ---

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const searchTerm = req.query.search || '';
        const userType = req.query.user_type; // Optional filter
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = parseInt(req.query.sortOrder) || -1;
        const skip = (page - 1) * limit;

        const query = {};
        if (userType && userType !== 'all') query.user_type = userType;
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const totalCount = await User.countDocuments(query);
        
        let sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        const users = await User.find(query)
            .select('-password')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            users,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.user_type = req.body.user_type || user.user_type;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            user_type: updatedUser.user_type
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin
        if (user.user_type === 'admin') {
            const adminCount = await User.countDocuments({ user_type: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last remaining admin.' });
            }
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new user/admin
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
    const { name, email, password, user_type } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            user_type: user_type || 'student'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            user_type: user.user_type
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- REPORT MANAGEMENT ---

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const searchTerm = req.query.search || '';
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = parseInt(req.query.sortOrder) || -1;
        const skip = (page - 1) * limit;

        const query = searchTerm ? {
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { report_type: { $regex: searchTerm, $options: 'i' } }
            ]
        } : {};

        const totalCount = await SustainabilityReport.countDocuments(query);
        
        let sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        const reports = await SustainabilityReport.find(query)
            .populate('user_id', 'name email user_type')
            .populate('resolvedBy', 'name email user_type')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            reports,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete report
// @route   DELETE /api/admin/reports/:id
// @access  Private (Admin)
exports.deleteReport = async (req, res) => {
    try {
        const report = await SustainabilityReport.findById(req.params.id);
        if (report) {
            await SustainabilityReport.findByIdAndDelete(req.params.id);
            res.json({ message: 'Report removed' });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- USAGE MANAGEMENT ---

// @desc    Get all usage logs across all staff
// @route   GET /api/admin/usage
// @access  Private (Admin)
exports.getAllUsage = async (req, res) => {
    try {
        const ResourceUsage = require('../models/ResourceUsage');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const searchTerm = req.query.search || '';
        const resourceType = req.query.resourceType;
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = parseInt(req.query.sortOrder) || -1;
        const skip = (page - 1) * limit;

        const query = {};
        if (resourceType && resourceType !== 'all') query.resourceType = resourceType;
        if (searchTerm) {
            query.$or = [
                { location: { $regex: searchTerm, $options: 'i' } },
                { resourceType: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const totalCount = await ResourceUsage.countDocuments(query);
        const usageData = await ResourceUsage.find(query)
            .populate('loggedBy', 'name email user_type')
            .lean();

        usageData.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'loggedBy') {
                valA = a.loggedBy?.name || '';
                valB = b.loggedBy?.name || '';
            } else {
                valA = a[sortBy] || '';
                valB = b[sortBy] || '';
            }
            
            if (valA < valB) return sortOrder == 1 ? -1 : 1;
            if (valA > valB) return sortOrder == 1 ? 1 : -1;
            return 0;
        });

        const paginatedUsage = usageData.slice(skip, skip + limit);

        res.json({
            usageData: paginatedUsage,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- DASHBOARD ANALYTICS ---

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalReports = await SustainabilityReport.countDocuments({});
        const wasteReports = await SustainabilityReport.countDocuments({ report_type: 'waste' });
        const energyReports = await SustainabilityReport.countDocuments({ report_type: 'energy' });
        const waterReports = await SustainabilityReport.countDocuments({ report_type: 'water' });

        res.json({
            totalUsers,
            totalReports,
            wasteReports,
            energyReports,
            waterReports
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
