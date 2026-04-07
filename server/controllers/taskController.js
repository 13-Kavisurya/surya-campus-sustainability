const SustainabilityTask = require('../models/SustainabilityTask');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Staff)
exports.createTask = async (req, res) => {
    const { title, description, assigned_to } = req.body;

    try {
        const task = await SustainabilityTask.create({
            title,
            description,
            assigned_to: assigned_to || req.user._id
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private (Staff/Student limits)
exports.getTasks = async (req, res) => {
    const { status } = req.query;
    let query = {};

    // If student, maybe they can't see tasks, or only ones assigned to them? The spec says assigned_to is a staff ID. 
    // Usually tasks are for Staff.
    if (req.user.user_type === 'student') {
        return res.status(403).json({ message: 'Students cannot view staff tasks' });
    }

    if (status) query.status = status;

    try {
        const tasks = await SustainabilityTask.find(query)
            .populate('assigned_to', 'name email')
            .sort({ created_at: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Staff)
exports.updateTask = async (req, res) => {
    const { title, description, assigned_to, status } = req.body;

    try {
        if (req.user.user_type !== 'staff') {
            return res.status(403).json({ message: 'Only staff can update tasks' });
        }

        const task = await SustainabilityTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (assigned_to) task.assigned_to = assigned_to;
        if (status) task.status = status;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Staff)
exports.deleteTask = async (req, res) => {
    try {
        if (req.user.user_type !== 'staff') {
            return res.status(403).json({ message: 'Only staff can delete tasks' });
        }

        const task = await SustainabilityTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await SustainabilityTask.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
