const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('staff'), createTask)
    .get(protect, authorize('staff'), getTasks);

router.route('/:id')
    .put(protect, authorize('staff'), updateTask)
    .delete(protect, authorize('staff'), deleteTask);

module.exports = router;
