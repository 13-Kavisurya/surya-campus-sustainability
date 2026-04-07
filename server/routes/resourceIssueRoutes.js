const express = require('express');
const router = express.Router();
const {
    createIssue,
    getIssues,
    updateIssue,
    deleteIssue
} = require('../controllers/resourceIssueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createIssue)
    .get(protect, getIssues);

router.route('/:id')
    .put(protect, updateIssue)
    .delete(protect, deleteIssue);

module.exports = router;
