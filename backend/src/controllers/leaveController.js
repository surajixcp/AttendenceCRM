const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /leaves/apply
// @access  Private
const applyLeave = async (req, res) => {
    const { leaveType, reason, startDate, endDate } = req.body;

    const leave = await Leave.create({
        user: req.user._id,
        leaveType,
        reason,
        startDate,
        endDate
    });

    res.status(201).json(leave);
};

// @desc    Get user's leaves
// @route   GET /leaves/list/:userId
// @access  Private
const getUserLeaves = async (req, res) => {
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const leaves = await Leave.find({ user: req.params.userId });
    res.json(leaves);
};

// @desc    Get all pending leaves
// @route   GET /leaves/pending
// @access  Private (Admin/Sub-Admin)
const getPendingLeaves = async (req, res) => {
    const leaves = await Leave.find({ status: 'pending' }).populate('user', 'name email');
    res.json(leaves);
};

// @desc    Get all leaves (filtering supported)
// @route   GET /leaves/all
// @access  Private (Admin/Sub-Admin)
const getAllLeaves = async (req, res) => {
    const { status, search } = req.query;

    let query = {};

    // Status Filter
    if (status && status !== 'All') {
        query.status = status.toLowerCase();
    }

    // Search Filter (for reason)
    if (search) {
        query.reason = { $regex: search, $options: 'i' };
    }

    const leaves = await Leave.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(leaves);
};

// @desc    Approve leave
// @route   POST /leaves/approve/:id
// @access  Private (Admin/Sub-Admin)
const approveLeave = async (req, res) => {
    const leave = await Leave.findById(req.params.id);

    if (leave) {
        leave.status = 'approved';
        leave.approvedBy = req.user._id;
        await leave.save();
        res.json(leave);
    } else {
        res.status(404).json({ message: 'Leave request not found' });
    }
};

// @desc    Reject leave
// @route   POST /leaves/reject/:id
// @access  Private (Admin/Sub-Admin)
const rejectLeave = async (req, res) => {
    const leave = await Leave.findById(req.params.id);

    if (leave) {
        leave.status = 'rejected';
        leave.approvedBy = req.user._id;
        await leave.save();
        res.json(leave);
    } else {
        res.status(404).json({ message: 'Leave request not found' });
    }
};

module.exports = {
    applyLeave,
    getUserLeaves,
    getPendingLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave
};
