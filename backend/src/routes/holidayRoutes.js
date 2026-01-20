const express = require('express');
const router = express.Router();
const {
    createHoliday,
    getHolidays,
    updateHoliday,
    deleteHoliday
} = require('../controllers/holidayController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

router.post('/', protect, subAdmin, createHoliday);
router.get('/', protect, getHolidays);
router.put('/:id', protect, subAdmin, updateHoliday);
router.delete('/:id', protect, subAdmin, deleteHoliday);

module.exports = router;
