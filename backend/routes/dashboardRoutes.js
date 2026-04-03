const express = require('express');
const { authenticateRequest, requireViewerOrAbove, requireAnalystOrAdmin } = require('../middleware/auth');
const { getSummary, getTotals, getCategoryBreakdown } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticateRequest);

router.get('/totals', requireViewerOrAbove, getTotals);
router.get('/summary', requireViewerOrAbove, getSummary);
router.get('/categories', requireViewerOrAbove, getCategoryBreakdown);

module.exports = router;
