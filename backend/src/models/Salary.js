const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // Format: YYYY-MM
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    deductions: {
        type: Number,
        default: 0
    },
    overtimeCredits: {
        type: Number,
        default: 0
    },
    totalPayable: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    },
    paidDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Salary', salarySchema);
