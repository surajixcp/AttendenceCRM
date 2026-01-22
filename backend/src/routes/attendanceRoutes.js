const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    updateAttendanceTiming,
    createManualAttendance,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceSummary,
    getAllAttendance,
    exportAttendanceToExcel
} = require('../controllers/attendanceController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

// Employee routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/daily/:userId', protect, getDailyAttendance);
router.get('/monthly/:userId', protect, getMonthlyAttendance);

// Admin routes
router.put('/admin/update/:attendanceId', protect, subAdmin, updateAttendanceTiming);
router.post('/admin/create', protect, subAdmin, createManualAttendance);
router.get('/summary', protect, subAdmin, getAttendanceSummary);
router.get('/logs', protect, subAdmin, getAllAttendance);
router.get('/export', protect, subAdmin, exportAttendanceToExcel);

module.exports = router;
