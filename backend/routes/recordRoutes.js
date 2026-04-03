const express = require('express');
const { authenticateRequest, requireViewerOrAbove, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRecord, getRecords, getRecordById, updateRecord, deleteRecord, createRecordValidation, updateRecordValidation } = require('../controllers/recordController');

const router = express.Router();

router.use(authenticateRequest);

router.get('/', requireViewerOrAbove, getRecords);
router.get('/:id', requireViewerOrAbove, getRecordById);
router.post('/', requireAdmin, createRecordValidation, validate, createRecord);
router.put('/:id', requireAdmin, updateRecordValidation, validate, updateRecord);
router.delete('/:id', requireAdmin, deleteRecord);

module.exports = router;
