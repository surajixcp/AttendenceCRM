const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, subAdmin } = require('../middlewares/authMiddleware');

router.get('/', protect, getSettings);
router.put('/', protect, subAdmin, updateSettings);

module.exports = router;
