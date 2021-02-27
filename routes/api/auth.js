const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const auth = require('../../middleware/auth');
const authController = require('../../controller/authController');

// @route   GET api/auth
// @desc    Verify user (route to be hit by the client for regular verification)
// @access  Public
router.get('/', auth, authController.getUser);

// @route   POST api/auth
// @desc    Authenticate user and sign in
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email!').isEmail(),
    check('password', 'Password is required!').exists(),
  ],
  authController.signIn
);

module.exports = router;
