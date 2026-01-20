const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getUserLeaves,
    getPendingLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave
} = require('../controllers/leaveController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

router.post('/apply', protect, applyLeave);
router.get('/list/:userId', protect, getUserLeaves);
router.get('/pending', protect, subAdmin, getPendingLeaves);
router.get('/all', protect, subAdmin, getAllLeaves); // Added
router.post('/approve/:id', protect, subAdmin, approveLeave);
router.post('/reject/:id', protect, subAdmin, rejectLeave);

module.exports = router;
