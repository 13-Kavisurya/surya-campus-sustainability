const mongoose = require('mongoose');

const sustainabilityReportSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    report_type: {
        type: String,
        enum: ['waste', 'water', 'energy', 'suggestion'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'resolved', 'rejected'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

module.exports = mongoose.model('SustainabilityReport', sustainabilityReportSchema);
