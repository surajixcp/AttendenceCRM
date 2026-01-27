const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    sod: {
        type: String,
        required: true
    },
    sodTime: {
        type: Date,
        default: Date.now
    },
    eod: {
        type: String
    },
    eodTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Ensure a user can only have one report record per day
reportSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
