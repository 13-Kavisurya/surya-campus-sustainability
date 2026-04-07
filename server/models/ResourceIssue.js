const mongoose = require('mongoose');

const resourceIssueSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        enum: ['Water', 'Electricity', 'Waste', 'Transport'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    issueType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    imageUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    savingsEstimation: {
        daily: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        annual: { type: Number, default: 0 },
        monthlyReduction: { type: Number, default: 0 },
        overusage: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

resourceIssueSchema.pre('save', async function () {
    this.updatedAt = Date.now();

    // Auto-calculate savings if daily is set
    if (this.savingsEstimation.daily) {
        this.savingsEstimation.monthly = this.savingsEstimation.daily * 30;
        this.savingsEstimation.annual = this.savingsEstimation.daily * 365;
    }
});

module.exports = mongoose.model('ResourceIssue', resourceIssueSchema);
