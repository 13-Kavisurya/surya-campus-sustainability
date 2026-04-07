const express = require('express');
const router = express.Router();
const {
    logUsage,
    importUsage,
    getUsage,
    getAnalytics,
    updateUsage,
    deleteUsage
} = require('../controllers/resourceUsageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('manager', 'admin', 'staff'), logUsage)
    .get(protect, getUsage);

router.post('/import', protect, authorize('manager', 'admin', 'staff'), importUsage);

router.get('/analytics', protect, getAnalytics);

router.route('/:id')
    .put(protect, authorize('manager', 'admin'), updateUsage)
    .delete(protect, authorize('manager', 'admin'), deleteUsage);

module.exports = router;
