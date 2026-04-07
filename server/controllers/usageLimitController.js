const UsageLimit = require('../models/UsageLimit');
const ResourceUsage = require('../models/ResourceUsage');

// @desc    Get all usage limits
// @route   GET /api/limits
// @access  Private
exports.getLimits = async (req, res) => {
    try {
        const limits = await UsageLimit.find({});
        res.json(limits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set or update usage limit for a resource
// @route   POST /api/limits
// @access  Private/Admin
exports.setLimit = async (req, res) => {
    const { resourceType, monthlyLimit, unit, alertThreshold } = req.body;

    try {
        let limit = await UsageLimit.findOne({ resourceType });

        if (limit) {
            // Update existing limit
            limit.monthlyLimit = monthlyLimit;
            limit.unit = unit || limit.unit;
            limit.alertThreshold = alertThreshold || limit.alertThreshold;
            await limit.save();
        } else {
            // Create new limit
            limit = await UsageLimit.create({
                resourceType,
                monthlyLimit,
                unit,
                alertThreshold
            });
        }

        res.json(limit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current month usage vs limits
// @route   GET /api/limits/status
// @access  Private
exports.getLimitStatus = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const limits = await UsageLimit.find({});
        const statusData = [];

        for (const limit of limits) {
            // Get total usage for this resource this month
            const usageLogs = await ResourceUsage.find({
                resourceType: limit.resourceType,
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            const totalUsage = usageLogs.reduce((sum, log) => {
                return sum + (log.metrics?.units || 0);
            }, 0);

            const percentUsed = (totalUsage / limit.monthlyLimit) * 100;
            const isOverLimit = totalUsage > limit.monthlyLimit;
            const isNearLimit = percentUsed >= limit.alertThreshold;

            statusData.push({
                resourceType: limit.resourceType,
                limit: limit.monthlyLimit,
                used: totalUsage,
                remaining: Math.max(0, limit.monthlyLimit - totalUsage),
                percentUsed: Math.round(percentUsed * 10) / 10,
                unit: limit.unit,
                alertThreshold: limit.alertThreshold,
                isOverLimit,
                isNearLimit,
                status: isOverLimit ? 'exceeded' : isNearLimit ? 'warning' : 'normal'
            });
        }

        res.json({
            month: startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            resources: statusData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete usage limit
// @route   DELETE /api/limits/:id
// @access  Private/Admin
exports.deleteLimit = async (req, res) => {
    try {
        const limit = await UsageLimit.findById(req.params.id);
        if (limit) {
            await UsageLimit.findByIdAndDelete(req.params.id);
            res.json({ message: 'Limit removed' });
        } else {
            res.status(404).json({ message: 'Limit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
