const mongoose = require('mongoose');

const resourceUsageSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        enum: ['Water', 'Electricity', 'Waste', 'Transport'],
        required: true
    },
    metrics: {
        // Water: meterReading (litres), costPerUnit
        // Electricity: unitsConsumed (kWh), tariff
        // Waste: volume (kg), segregationPercentage
        // Transport: fuelUsed (litres), distanceCovered (km)
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    usageReduced: {
        type: Number,
        default: 0
    },
    loggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        default: ''
    },
    totalCost: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ResourceUsage', resourceUsageSchema);
