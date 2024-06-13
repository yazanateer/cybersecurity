const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

//define the routes for each function

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot_password', authController.forgot_password);
router.post('/change_password', authController.change_password);

module.exports = router; 