const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    updateReport,
    deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReport)
    .get(protect, getReports);

router.route('/:id')
    .put(protect, updateReport)
    .delete(protect, deleteReport);

module.exports = router;
