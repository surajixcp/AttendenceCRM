const express = require('express');
const router = express.Router();
const {
    submitSOD,
    submitEOD,
    getMyReports,
    getAllReports
} = require('../controllers/reportController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

// Employee routes
router.post('/sod', protect, submitSOD);
router.post('/eod', protect, submitEOD);
router.get('/my', protect, getMyReports);

// Admin routes
router.get('/admin', protect, subAdmin, getAllReports);

module.exports = router;
