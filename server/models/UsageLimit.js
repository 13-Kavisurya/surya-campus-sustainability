const mongoose = require('mongoose');

const usageLimitSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        enum: ['Water', 'Electricity', 'Waste', 'Transport'],
        required: true,
        unique: true
    },
    monthlyLimit: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: 'units'
    },
    alertThreshold: {
        type: Number,
        default: 80, // Alert when 80% of limit is reached
        min: 0,
        max: 100
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

usageLimitSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('UsageLimit', usageLimitSchema);
