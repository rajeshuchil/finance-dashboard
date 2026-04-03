const express = require('express');
const { authenticateRequest, requireViewerOrAbove, requireAnalystOrAdmin } = require('../middleware/auth');
const { getSummary, getTotals, getCategoryBreakdown } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authenticateRequest);

router.get('/totals', requireViewerOrAbove, getTotals);
router.get('/summary', requireAnalystOrAdmin, getSummary);
router.get('/categories', requireAnalystOrAdmin, getCategoryBreakdown);

module.exports = router;
