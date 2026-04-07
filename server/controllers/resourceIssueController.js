const ResourceIssue = require('../models/ResourceIssue');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// @desc    Create a new resource issue
// @route   POST /api/issues
// @access  Private (Student/Manager/Admin)
exports.createIssue = async (req, res) => {
    const { resourceType, location, issueType, description, imageUrl } = req.body;

    try {
        const issue = await ResourceIssue.create({
            resourceType,
            location,
            issueType,
            description,
            imageUrl,
            createdBy: req.user._id
        });

        // Notify Managers (non-blocking — don't let email failure crash issue creation)
        try {
            const managers = await User.find({ user_type: { $in: ['staff', 'admin'] } });
            const managerEmails = managers.map(u => u.email);
            if (managerEmails.length > 0) {
                await emailService.sendManagerAlert(managerEmails, issue);
            }
        } catch (emailErr) {
            console.error('Email notification failed (issue was still saved):', emailErr.message);
        }

        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all issues (filtered by role and resourceType)
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res) => {
    const { resourceType, status } = req.query;
    let query = {};

    // Students only see their own reports
    if (req.user.user_type === 'student') {
        query.createdBy = req.user._id;
    }

    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;

    try {
        const issues = await ResourceIssue.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update issue status, details, & savings
// @route   PUT /api/issues/:id
// @access  Private (Owner/Manager/Admin)
exports.updateIssue = async (req, res) => {
    const { status, savingsEstimation, resourceType, location, issueType, description, imageUrl } = req.body;

    try {
        const issue = await ResourceIssue.findById(req.params.id).populate('createdBy', 'email name');

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const isOwner = issue.createdBy._id.toString() === req.user._id.toString();
        const isStaffOrAdmin = req.user.user_type === 'staff' || req.user.user_type === 'admin';

        if (!isOwner && !isStaffOrAdmin) {
            return res.status(401).json({ message: 'Not authorized to update this issue' });
        }

        // Only allow students to update if it exists and is pending, managers can always update details
        if (isOwner && req.user.user_type === 'student' && issue.status !== 'Pending') {
             return res.status(400).json({ message: 'Cannot update an issue that is already In Progress or Resolved' });
        }

        // Update generic fields
        if (resourceType) issue.resourceType = resourceType;
        if (location) issue.location = location;
        if (issueType) issue.issueType = issueType;
        if (description) issue.description = description;
        if (imageUrl !== undefined) issue.imageUrl = imageUrl; 

        // Update status and savings (only managers/admins)
        if (isStaffOrAdmin) {
            if (status) issue.status = status;
            if (savingsEstimation) {
                issue.savingsEstimation = {
                    ...issue.savingsEstimation,
                    ...savingsEstimation
                };
                if (status === 'Resolved') {
                    issue.resolvedBy = req.user._id;
                }
            }
        }

        const updatedIssue = await issue.save();

        // Trigger email to student if resolved (non-blocking)
        if (status === 'Resolved' && issue.createdBy && issue.createdBy.email) {
            try {
                await emailService.sendStudentResolutionEmail(issue.createdBy.email, updatedIssue);
            } catch (emailErr) {
                console.error('Resolution email failed (issue was still updated):', emailErr.message);
            }
        }

        res.json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin/Owner)
exports.deleteIssue = async (req, res) => {
    try {
        const issue = await ResourceIssue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Check ownership or admin role
        if (issue.createdBy.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await ResourceIssue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Issue removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
