const Meeting = require('../models/Meeting');

// @desc    Create a new meeting
// @route   POST /meetings
// @access  Private
const createMeeting = async (req, res) => {
    try {
        const { title, description, date, time, attendees, platform, meetingLink } = req.body;

        const meeting = await Meeting.create({
            title,
            description,
            date,
            time,
            attendees,
            platform,
            meetingLink,
            createdBy: req.user._id
        });

        res.status(201).json(meeting);
    } catch (error) {
        console.error('Create Meeting Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all meetings (Admin sees all, user sees their own)
// @route   GET /meetings
// @access  Private
const getMeetings = async (req, res) => {
    try {
        let meetings;

        if (req.user.role === 'admin' || req.user.role === 'sub-admin') {
            meetings = await Meeting.find({}).populate('attendees', 'name email').populate('createdBy', 'name');
        } else {
            meetings = await Meeting.find({ attendees: req.user._id }).populate('attendees', 'name email').populate('createdBy', 'name');
        }

        res.json(meetings);
    } catch (error) {
        console.error('Get Meetings Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get meetings for a specific user
// @route   GET /meetings/user/:userId
// @access  Private
const getUserMeetings = async (req, res) => {
    // Check permission
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const meetings = await Meeting.find({ attendees: req.params.userId }).populate('attendees', 'name email').populate('createdBy', 'name');
    res.json(meetings);
};

// @desc    Update meeting
// @route   PUT /meetings/:id
// @access  Private/Admin
const updateMeeting = async (req, res) => {
    const meeting = await Meeting.findById(req.params.id);

    if (meeting) {
        meeting.title = req.body.title || meeting.title;
        meeting.description = req.body.description || meeting.description;
        meeting.date = req.body.date || meeting.date;
        meeting.time = req.body.time || meeting.time;
        meeting.attendees = req.body.attendees || meeting.attendees;
        meeting.platform = req.body.platform || meeting.platform;
        meeting.meetingLink = req.body.meetingLink || meeting.meetingLink;

        const updatedMeeting = await meeting.save();
        res.json(updatedMeeting);
    } else {
        res.status(404).json({ message: 'Meeting not found' });
    }
};

// @desc    Delete meeting
// @route   DELETE /meetings/:id
// @access  Private/Admin
const deleteMeeting = async (req, res) => {
    const meeting = await Meeting.findById(req.params.id);

    if (meeting) {
        await Meeting.deleteOne({ _id: meeting._id });
        res.json({ message: 'Meeting removed' });
    } else {
        res.status(404).json({ message: 'Meeting not found' });
    }
};

module.exports = {
    createMeeting,
    getMeetings,
    getUserMeetings,
    updateMeeting,
    deleteMeeting
};
