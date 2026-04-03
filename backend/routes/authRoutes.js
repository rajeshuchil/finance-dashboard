const express = require('express');
const validate = require('../middleware/validate');
const { authenticateRequest } = require('../middleware/auth');
const { register, login, getMe, registerValidation, loginValidation } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticateRequest, getMe);

module.exports = router;
