const express = require('express');
const router = express.Router();
const {
    createProject,
    assignProject,
    getProjects,
    getProjectById,
    updateProject
} = require('../controllers/projectController');
const { protect, admin, subAdmin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, createProject);
router.post('/assign', protect, admin, assignProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id/progress', protect, require('../controllers/projectController').updateProjectProgress);
// Match frontend service which uses PUT
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, require('../controllers/projectController').deleteProject);

module.exports = router;
