const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceSummary,
    getAllAttendance
} = require('../controllers/attendanceController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/daily/:userId', protect, getDailyAttendance);
router.get('/monthly/:userId', protect, getMonthlyAttendance);
router.get('/summary', protect, subAdmin, getAttendanceSummary);
router.get('/logs', protect, subAdmin, getAllAttendance); // Added

module.exports = router;
