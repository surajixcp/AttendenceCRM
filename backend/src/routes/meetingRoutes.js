const express = require('express');
const router = express.Router();
const {
    createMeeting,
    getMeetings,
    getUserMeetings,
    updateMeeting,
    deleteMeeting
} = require('../controllers/meetingController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createMeeting);
router.get('/', protect, getMeetings);
router.get('/user/:userId', protect, getUserMeetings);
router.put('/:id', protect, updateMeeting);
router.delete('/:id', protect, deleteMeeting);

module.exports = router;
