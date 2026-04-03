const express = require('express');
const { authenticateRequest, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getAllUsers, getUserById, updateRole, updateStatus, updateRoleValidation, updateStatusValidation } = require('../controllers/userController');

const router = express.Router();

router.use(authenticateRequest, requireAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', updateRoleValidation, validate, updateRole);
router.patch('/:id/status', updateStatusValidation, validate, updateStatus);

module.exports = router;
