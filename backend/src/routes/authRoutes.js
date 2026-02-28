const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Register route
router.post('/register', validateRegister, authController.register);

// Login route
router.post('/login', validateLogin, authController.login);

// Get current user (protected)
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;