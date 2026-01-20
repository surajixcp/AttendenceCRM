const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// @desc    Upload profile image
// @route   POST /upload/profile
// @access  Public (or Private)
router.post('/profile', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
});

// @desc    Upload company logo
// @route   POST /upload/logo
// @access  Public
router.post('/logo', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
});

module.exports = router;
