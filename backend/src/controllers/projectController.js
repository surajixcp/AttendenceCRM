const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /projects
// @access  Private (Admin/Sub-Admin)
const createProject = async (req, res) => {
    const { name, description, startDate, endDate, userIds, assignedTo, status, progress } = req.body;

    const project = await Project.create({
        name,
        description,
        startDate: startDate || new Date(),
        endDate,
        assignedTo: userIds || assignedTo || [],
        status: status || 'active',
        progress: progress || 0
    });

    res.status(201).json(project);
};

// @desc    Assign users to project
// @route   POST /projects/assign
// @access  Private (Admin/Sub-Admin)
const assignProject = async (req, res) => {
    const { projectId, userIds } = req.body; // userIds is array of strings

    const project = await Project.findById(projectId);

    if (project) {
        // Add new users to existing list, avoiding duplicates if necessary
        // Using Set to ensure uniqueness if logic requires, otherwise simple concat
        // Here, we'll just push valid IDs. Mongoose might not dedup automatically without logic.

        project.assignedTo = [...new Set([...project.assignedTo, ...userIds])];
        await project.save();
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Get all projects
// @route   GET /projects
// @access  Private
const getProjects = async (req, res) => {
    // Employees only see projects they are assigned to
    if (req.user.role === 'employee') {
        const projects = await Project.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email');
        res.json(projects);
    } else {
        const projects = await Project.find({}).populate('assignedTo', 'name email');
        res.json(projects);
    }
};

// @desc    Get project by ID
// @route   GET /projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    const project = await Project.findById(req.params.id).populate('assignedTo', 'name email');

    if (project) {
        // Employee access check
        if (req.user.role === 'employee' && !project.assignedTo.some(u => u._id.toString() === req.user._id.toString())) {
            res.status(401).json({ message: 'Not authorized to view this project' });
            return;
        }
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Update project status/progress
// @route   PATCH /projects/:id
// @access  Private (Admin/Sub-Admin or maybe Employee if updating progress?)
const updateProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        project.name = req.body.name || project.name;
        project.description = req.body.description || project.description;
        project.status = req.body.status || project.status;
        project.progress = req.body.progress !== undefined ? req.body.progress : project.progress;
        project.deadline = req.body.deadline || project.deadline;
        project.endDate = req.body.endDate || project.endDate;

        // Handle members/assignedTo update if provided
        if (req.body.members || req.body.assignedTo || req.body.userIds) {
            project.assignedTo = req.body.members || req.body.assignedTo || req.body.userIds;
        }

        await project.save();
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Update project progress (Employee)
// @route   PUT /projects/:id/progress
// @access  Private
const updateProjectProgress = async (req, res) => {
    const { progress } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
        // Check if user is assigned to this project or is admin
        if (req.user.role === 'employee' && !project.assignedTo.includes(req.user._id)) {
            res.status(401).json({ message: 'Not authorized to update this project' });
            return;
        }

        project.progress = progress;
        await project.save();
        res.json(project);
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

// @desc    Delete project
// @route   DELETE /projects/:id
// @access  Private (Admin)
const deleteProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        await Project.deleteOne({ _id: project._id });
        res.json({ message: 'Project removed' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
};

module.exports = {
    createProject,
    assignProject,
    getProjects,
    getProjectById,
    updateProject,
    updateProjectProgress,
    deleteProject
};
