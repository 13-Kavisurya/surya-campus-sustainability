const express = require('express');
const router = express.Router();
const {
    getLimits,
    setLimit,
    getLimitStatus,
    deleteLimit
} = require('../controllers/usageLimitController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getLimits)
    .post(protect, authorize('admin'), setLimit);

router.get('/status', protect, getLimitStatus);

router.delete('/:id', protect, authorize('admin'), deleteLimit);

module.exports = router;
