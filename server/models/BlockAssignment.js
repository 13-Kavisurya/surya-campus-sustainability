const mongoose = require('mongoose');

const blockAssignmentSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    coordinator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BlockAssignment', blockAssignmentSchema);
