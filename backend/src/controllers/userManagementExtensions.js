// Add these to authController.js or a new userController.js
// For simplicity, I'll update authController.js to include user management functions

const User = require('../models/User');
// ... existing imports ...

// ... existing functions ...

// @desc    Get all users (with optional role filter)
// @route   GET /auth/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password');
    res.json(users);
};

// @desc    Update user
// @route   PUT /auth/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.designation = req.body.designation || user.designation;
        user.status = req.body.status || user.status;

        if (req.body.password) {
            user.password = req.body.password; // Will be hashed by pre-save middleware
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            designation: updatedUser.designation,
            status: updatedUser.status
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete user
// @route   DELETE /auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
