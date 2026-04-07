const BlockAssignment = require('../models/BlockAssignment');
const User = require('../models/User');

// @desc    Get all block assignments
// @route   GET /api/admin/block-assignments
// @access  Private (Admin)
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await BlockAssignment.find()
            .populate('coordinator_id', 'name email user_type');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update a block assignment
// @route   POST /api/admin/block-assignments
// @access  Private (Admin)
exports.updateAssignment = async (req, res) => {
    const { location, coordinator_id } = req.body;

    try {
        // Find if assignment exists for this location
        let assignment = await BlockAssignment.findOne({ location });

        if (assignment) {
            assignment.coordinator_id = coordinator_id;
            await assignment.save();
        } else {
            assignment = await BlockAssignment.create({
                location,
                coordinator_id
            });
        }

        const populatedAssignment = await BlockAssignment.findById(assignment._id)
            .populate('coordinator_id', 'name email user_type');

        res.json(populatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get coordinators (staff) for assignment dropdown
// @route   GET /api/admin/coordinators
// @access  Private (Admin)
exports.getCoordinators = async (req, res) => {
    try {
        const coordinators = await User.find({ user_type: 'staff' })
            .select('name email')
            .sort({ name: 1 });
        res.json(coordinators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
