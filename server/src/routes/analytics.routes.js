const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

// Protect all routes
router.use(authenticate);
router.use(isAdmin);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/games', analyticsController.getGamePerformance);
router.get('/charts', analyticsController.getPnlChart);

module.exports = router;
