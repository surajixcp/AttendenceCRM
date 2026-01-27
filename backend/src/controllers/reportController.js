const Report = require('../models/Report');

// @desc    Submit Start of Day (SOD) report
// @route   POST /reports/sod
// @access  Private (Employee)
const submitSOD = async (req, res) => {
    try {
        const { sod } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingReport = await Report.findOne({
            user: req.user._id,
            date: today
        });

        if (existingReport) {
            return res.status(400).json({ message: 'SOD already submitted for today.' });
        }

        const report = await Report.create({
            user: req.user._id,
            date: today,
            sod
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit End of Day (EOD) report
// @route   POST /reports/eod
// @access  Private (Employee)
const submitEOD = async (req, res) => {
    try {
        const { eod } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const report = await Report.findOne({
            user: req.user._id,
            date: today
        });

        if (!report) {
            return res.status(400).json({ message: 'SOD not found for today. Please submit SOD first.' });
        }

        if (report.eod) {
            return res.status(400).json({ message: 'EOD already submitted for today.' });
        }

        report.eod = eod;
        report.eodTime = Date.now();
        report.status = 'completed';

        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's reports
// @route   GET /reports/my
// @access  Private (Employee)
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ date: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports (Admin only)
// @route   GET /reports/admin
// @access  Private (Admin/Sub-admin)
const getAllReports = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        let query = {};

        if (userId) {
            query.user = userId;
        }

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const reports = await Report.find(query)
            .populate('user', 'name email designation department')
            .sort({ date: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitSOD,
    submitEOD,
    getMyReports,
    getAllReports
};
