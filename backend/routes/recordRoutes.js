const express = require('express');
const { authenticateRequest, requireViewerOrAbove, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRecord, getRecords, getRecordById, updateRecord, deleteRecord, recordIdValidation, createRecordValidation, updateRecordValidation, getRecordsValidation } = require('../controllers/recordController');

const router = express.Router();

router.use(authenticateRequest);

router.get('/', requireViewerOrAbove, getRecordsValidation, validate, getRecords);
router.get('/:id', requireViewerOrAbove, recordIdValidation, validate, getRecordById);
router.post('/', requireAdmin, createRecordValidation, validate, createRecord);
router.put('/:id', requireAdmin, updateRecordValidation, validate, updateRecord);
router.delete('/:id', requireAdmin, recordIdValidation, validate, deleteRecord);

module.exports = router;
