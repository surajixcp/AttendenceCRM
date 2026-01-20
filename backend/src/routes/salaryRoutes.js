const express = require('express');
const router = express.Router();
const {
    generateSalary,
    getUserSalary,
    paySalary,
    getAllSalaries,
    updateSalary,
    generateBatchSalary
} = require('../controllers/salaryController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Add missing routes for Admin Dashboard
router.get('/', protect, admin, getAllSalaries);
router.put('/:id', protect, admin, updateSalary);

router.post('/generate', protect, admin, generateSalary);
router.post('/generate-batch', protect, admin, generateBatchSalary);
router.get('/user/:userId', protect, getUserSalary);
router.post('/pay/:id', protect, admin, paySalary);

module.exports = router;
