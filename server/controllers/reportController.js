const SustainabilityReport = require('../models/SustainabilityReport');
const mongoose = require('mongoose');

// @desc    Create a new sustainability report
// @route   POST /api/reports
// @access  Private (Student/Staff)
exports.createReport = async (req, res) => {
    const { report_type, title, description, location } = req.body;

    try {
        const report = await SustainabilityReport.create({
            report_type,
            title,
            description,
            location,
            user_id: req.user._id
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports (filtered by role and type)
// @route   GET /api/reports
// @access  Private (Student/Staff)
exports.getReports = async (req, res) => {
    const { report_type, status, search } = req.query;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = parseInt(req.query.sortOrder) || -1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    // Only staff and admin can see all reports. Students see only their own.
    if (req.user.user_type !== 'staff' && req.user.user_type !== 'admin') {
        const mongoose = require('mongoose');
        query.user_id = new mongoose.Types.ObjectId(req.user._id);
    }
    
    if (report_type) query.report_type = report_type;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ];
    }

    console.log('--- DEBUG: GET REPORTS ---');
    console.log('User Role:', req.user.user_type);
    console.log('User ID:', req.user._id);
    console.log('Final Query:', JSON.stringify(query));

    try {
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

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private (Owner/Staff)
exports.updateReport = async (req, res) => {
    const { status, report_type, title, description, location } = req.body;

    try {
        const report = await SustainabilityReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isOwner = report.user_id.toString() === req.user._id.toString();
        const isStaff = req.user.user_type === 'staff';

        if (!isOwner && !isStaff) {
            return res.status(401).json({ message: 'Not authorized to update this report' });
        }

        // Students can only update if pending
        if (isOwner && req.user.user_type === 'student' && report.status !== 'pending') {
             return res.status(400).json({ message: 'Cannot update a report that is already approved or resolved' });
        }

        // Update generic fields
        if (report_type) report.report_type = report_type;
        if (title) report.title = title;
        if (description) report.description = description;
        if (location) report.location = location;

        // Update status (only staff)
        if (isStaff && status) {
            report.status = status;
            // Track who resolved it
            if (status === 'resolved') {
                report.resolvedBy = req.user._id;
            } else if (status === 'pending') {
                report.resolvedBy = null; // Clear if moved back to pending
            }
        }

        const updatedReport = await report.save();
        res.json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Owner/Staff)
exports.deleteReport = async (req, res) => {
    try {
        const report = await SustainabilityReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check ownership or staff role
        if (report.user_id.toString() !== req.user._id.toString() && req.user.user_type !== 'staff') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await SustainabilityReport.findByIdAndDelete(req.params.id);
        res.json({ message: 'Report removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
