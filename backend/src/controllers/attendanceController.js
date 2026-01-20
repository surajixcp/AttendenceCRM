const Attendance = require('../models/Attendance');
const Settings = require('../models/Settings');

// @desc    Check in for attendance
// @route   POST /attendance/checkin
// @access  Private (Employee)
const checkIn = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
        user: req.user._id,
        date: today
    });

    if (existingAttendance) {
        res.status(400).json({ message: 'You have already checked in today.' });
        return;
    }

    // Fetch settings for policy check
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({}); // Default settings
    }

    const now = new Date();
    let status = 'present';

    // Late Check-in Logic
    if (settings.workingHours && settings.workingHours.checkIn) {
        const [h, m] = settings.workingHours.checkIn.split(':').map(Number);
        const policyTime = new Date(today);
        policyTime.setHours(h, m, 0, 0);

        const graceMs = (settings.workingHours.gracePeriod || 0) * 60 * 1000;
        const limitTime = new Date(policyTime.getTime() + graceMs);

        if (now > limitTime) {
            status = 'late';
        }
    }

    const attendance = await Attendance.create({
        user: req.user._id,
        date: today,
        checkIn: now,
        status: status
    });

    res.status(201).json(attendance);
};

// @desc    Check out for attendance
// @route   POST /attendance/checkout
// @access  Private (Employee)
const checkOut = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
        user: req.user._id,
        date: today
    });

    if (!attendance) {
        res.status(400).json({ message: 'You have not checked in today.' });
        return;
    }

    if (attendance.checkOut) {
        res.status(400).json({ message: 'You have already checked out today.' });
        return;
    }

    attendance.checkOut = new Date();

    // Calculate working hours
    const duration = attendance.checkOut - attendance.checkIn; // milliseconds
    const hours = duration / (1000 * 60 * 60);
    attendance.workingHours = hours.toFixed(2);

    // Dynamic Overtime Calculation
    let settings = await Settings.findOne();
    let standardShift = 9; // Default fallback (hours)

    if (settings && settings.workingHours && settings.workingHours.checkIn && settings.workingHours.checkOut) {
        const [inH, inM] = settings.workingHours.checkIn.split(':').map(Number);
        const [outH, outM] = settings.workingHours.checkOut.split(':').map(Number);

        // Calculate shift length in hours
        const shiftStart = inH + (inM / 60);
        const shiftEnd = outH + (outM / 60);

        let shiftLength = shiftEnd - shiftStart;
        if (shiftLength < 0) shiftLength += 24; // Handling night shifts

        if (shiftLength > 0) standardShift = shiftLength;
    }

    if (hours > standardShift) {
        attendance.overtimeHours = (hours - standardShift).toFixed(2);
    }

    await attendance.save();

    res.json(attendance);
};

// @desc    Get daily attendance for a user
// @route   GET /attendance/daily/:userId
// @access  Private
const getDailyAttendance = async (req, res) => {
    // Only admin/sub-admin can view others, or the user themselves
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.userId) {
        res.status(401).json({ message: 'Not authorized to view this attendance' });
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
        user: req.params.userId,
        date: today
    });

    if (attendance) {
        res.json(attendance);
    } else {
        res.json(null);
    }
};

// @desc    Get monthly attendance for a user
// @route   GET /attendance/monthly/:userId
// @access  Private
const getMonthlyAttendance = async (req, res) => {
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.userId) {
        res.status(401).json({ message: 'Not authorized to view this attendance' });
        return;
    }

    const { month, year } = req.query; // Expects ?month=1&year=2024

    if (!month || !year) {
        res.status(400).json({ message: 'Please provide month and year' });
        return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceList = await Attendance.find({
        user: req.params.userId,
        date: { $gte: startDate, $lte: endDate }
    });

    res.json(attendanceList);
};


// @desc    Get attendance summary (Admin)
// @route   GET /attendance/summary
// @access  Private (Admin/Sub-Admin)
const getAttendanceSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const User = require('../models/User'); // Ensure it's required at least once in this file or above
        const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
        const presentCount = await Attendance.countDocuments({ date: today, status: 'present' });
        const absentCount = totalEmployees - presentCount; // Simplified logic

        res.json({
            date: today,
            totalEmployees,
            present: presentCount,
            absent: absentCount
        });
    } catch (error) {
        console.error('Get Attendance Summary Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance logs (filtering supported)
// @route   GET /attendance/logs
// @access  Private (Admin/Sub-Admin)
const getAllAttendance = async (req, res) => {
    const { startDate, endDate, status } = req.query;

    let query = {};

    // Date Filter
    if (startDate && endDate) {
        // Adjust endDate to include the full day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        query.date = {
            $gte: new Date(startDate),
            $lte: end
        };
    } else if (startDate) {
        query.date = { $gte: new Date(startDate) };
    }

    // Status Filter
    if (status && status !== 'All') {
        query.status = status.toLowerCase();
    }

    // Populate user details (name, email)
    const logs = await Attendance.find(query)
        .populate('user', 'name email designation')
        .sort({ date: -1 });

    res.json(logs);
};

module.exports = {
    checkIn,
    checkOut,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceSummary,
    getAllAttendance
};
