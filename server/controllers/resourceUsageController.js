const ResourceUsage = require('../models/ResourceUsage');
const ResourceIssue = require('../models/ResourceIssue');

// @desc    Log new resource usage
// @route   POST /api/usage
// @access  Private (Manager/Admin)
exports.logUsage = async (req, res) => {
    const { resourceType, metrics, usageReduced, location, date, totalCost } = req.body;

    try {
        const usage = await ResourceUsage.create({
            resourceType,
            metrics,
            usageReduced,
            location,
            totalCost,
            date: date || Date.now(),
            loggedBy: req.user._id
        });

        res.status(201).json(usage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk import resource usage (CSV)
// @route   POST /api/usage/import
// @access  Private (Staff/Admin)
exports.importUsage = async (req, res) => {
    try {
        const usageDataArray = req.body.data;
        
        if (!Array.isArray(usageDataArray) || usageDataArray.length === 0) {
            return res.status(400).json({ message: 'No data provided for import' });
        }

        // Map array and insert
        const recordsToInsert = usageDataArray.map(item => ({
            resourceType: item.resourceType,
            metrics: item.metrics || {},
            usageReduced: item.usageReduced || 0,
            location: item.location,
            totalCost: item.totalCost || 0,
            date: item.date ? new Date(item.date) : Date.now(),
            loggedBy: req.user._id
        }));

        const inserted = await ResourceUsage.insertMany(recordsToInsert);
        
        res.status(201).json({ 
            message: `Successfully imported ${inserted.length} records.`,
            count: inserted.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get usage data (with optional filters)
// @route   GET /api/usage
// @access  Private
exports.getUsage = async (req, res) => {
    const { resourceType, startDate, endDate, search, sortBy = 'date', sortOrder = -1 } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (resourceType) query.resourceType = resourceType;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
        query.$or = [
            { location: { $regex: search, $options: 'i' } },
            { resourceType: { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const totalCount = await ResourceUsage.countDocuments(query);
        let usageData = await ResourceUsage.find(query)
            .populate('loggedBy', 'name')
            .lean();

        // Sort in memory to handle populated fields if needed, 
        // though date/resourceType/location/totalCost work fine in DB.
        // For loggedBy.name, we'll need in-memory sorting if we want to be exact.
        
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

        const paginatedData = usageData.slice(skip, skip + limit);

        res.json({
            usageData: paginatedData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Sustainability Index & Analytics
// @route   GET /api/usage/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
    try {
        // Aggregate total savings from resolved issues
        const savingsData = await ResourceIssue.aggregate([
            { $match: { status: 'Resolved' } },
            {
                $group: {
                    _id: '$resourceType',
                    totalMonthlyReduction: { $sum: '$savingsEstimation.monthlyReduction' },
                    totalMonthlySavings: { $sum: '$savingsEstimation.monthly' },
                    averageOverusage: { $avg: '$savingsEstimation.overusage' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Aggregate usage data (last 30 days)
        const recentUsage = await ResourceUsage.aggregate([
            {
                $match: {
                    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: '$resourceType',
                    usageReduced: { $sum: '$usageReduced' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Simple Sustainability Index Calculation
        // Score (0-100) based on savings vs usage counts and costs
        // This is a representative mockup logic as requested: "Keep simple savings logic"
        const resourceScores = {
            Water: 75,
            Electricity: 60,
            Waste: 85,
            Transport: 50
        };

        // If we have actual savings, boost the score
        savingsData.forEach(item => {
            if (resourceScores[item._id]) {
                resourceScores[item._id] = Math.min(100, resourceScores[item._id] + (item.count * 2));
            }
        });

        const overallIndex = Object.values(resourceScores).reduce((a, b) => a + b, 0) / 4;

        res.json({
            overallIndex: Math.round(overallIndex),
            resourceScores,
            savingsData,
            recentUsage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update usage log
// @route   PUT /api/usage/:id
// @access  Private (Manager/Admin)
exports.updateUsage = async (req, res) => {
    const { resourceType, metrics, usageReduced, date } = req.body;

    try {
        const usage = await ResourceUsage.findById(req.params.id);

        if (!usage) {
            return res.status(404).json({ message: 'Usage log not found' });
        }

        usage.resourceType = resourceType || usage.resourceType;
        usage.metrics = metrics || usage.metrics;
        usage.usageReduced = usageReduced !== undefined ? usageReduced : usage.usageReduced;
        usage.date = date || usage.date;

        const updatedUsage = await usage.save();
        res.json(updatedUsage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete usage log
// @route   DELETE /api/usage/:id
// @access  Private (Manager/Admin)
exports.deleteUsage = async (req, res) => {
    try {
        const usage = await ResourceUsage.findById(req.params.id);

        if (!usage) {
            return res.status(404).json({ message: 'Usage log not found' });
        }

        await ResourceUsage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usage log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
