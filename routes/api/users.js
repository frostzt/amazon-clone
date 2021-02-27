const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const userController = require('../../controller/userController');
const auth = require('../../middleware/auth');

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', userController.getAllUsers);

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Please include a valid email!').isEmail(),
    check(
      'password',
      'Please enter a password containing more that 8 characters'
    ).isLength({ min: 8 }),
  ],
  userController.registerUser
);

// @route   PATCH api/users
// @desc    Update user data
// @access  Private
router.patch(
  '/',
  [auth, [check('email', 'Please include a valid email!').isEmail()]],
  userController.updateUser
);

// @route   DELETE api/users
// @desc    Delete user
// @access  Private
router.delete('/', auth, userController.deleteUser);

// FORGET AND RESET PASSWORD
// @route   POST api/users/forgotPassword
// @desc    Generate reset token and send it back
// @access  Public
router.post(
  '/forgotPassword',
  [check('email', 'Please provide a valid email').isEmail()],
  userController.forgotPassword
);

// @route   PATCH api/users/resetPassword
// @desc    Use the generated reset token to allow the user to change their password
// @access  Public but Tokenized
router.patch(
  '/resetPassword/:resetToken',
  [
    check('password', 'Please provide a valid password!').isLength({
      min: 8,
    }),
  ],
  userController.resetPassword
);

// CHANGE USER PASSWORD IF CURRENTLY LOGGEDIN
// @route   PATCH api/users/changePassword
// @desc    Change the user's password if they are currently logged in
// @access  Private
router.patch(
  '/changePassword',
  [
    check('newPassword', 'Please provide a valid password!').isLength({
      min: 8,
    }),
  ],
  auth,
  userController.changePassword
);

// @route   PATCH api/users/follow/:userid
// @desc    Follow a user
// @access  Private
router.patch('/follow/:userid', auth, userController.followUser);

// @route   PATCH api/users/unfollow/:userid
// @desc    Unfollow a user
// @access  Private
router.patch('/unfollow/:userid', auth, userController.unfollowUser);

module.exports = router;
