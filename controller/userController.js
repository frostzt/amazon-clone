const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const Mood = require('../models/Mood');
const { handleServerError } = require('../utils/utilHandler');

// CREATE AND SEND THE TOKEN
const createAndSendToken = (user, req, res) => {
  // Return JWT
  const payload = {
    user: {
      id: user.id,
    },
  };

  jwt.sign(
    payload,
    process.env.JWTSECRET,
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.status(200).json({ token });
    }
  );
};

// @route   POST api/users
// @desc    Get all users
// @access  Public
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   POST api/users
// @desc    Register user
// @access  Public
exports.registerUser = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { name, email, password, dateofbirth, gender, bio } = req.body;

  bio = !bio ? 'A happiness machine...' : bio;

  try {
    // CHECK IF THE USER ALREADY EXISTS
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({
      name,
      email,
      password,
      dateofbirth,
      gender,
      bio,
    });

    // ENCRYPT PASSWORD
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // SEND THE TOKEN
    createAndSendToken(user, req, res);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   POST api/users/forgotPassword
// @desc    Generate reset token and send it back
// @access  Public
exports.forgotPassword = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // GET THE USER BASED ON THE EMAIL
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      msg:
        'A mail with the reset link has been sent if there is an account associated with that email!',
    });
  }

  // GENERATE RANDOM RESET TOKEN
  const resetToken = user.generateRandomResetToken();
  await user.save();

  try {
    // @TODO SEND THE TOKEN USING THE EMAIL
    console.log(resetToken);
    res.status(200).json({
      msg:
        'A mail with the reset link has been sent if there is an account associated with that email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    handleServerError(res, err);
  }
};

// @route   POST api/users/resetPassword
// @desc    Use the generated reset token to allow the user to change their password
// @access  Private
exports.resetPassword = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // CHECK IF THE USER PROVIDED A PASSWORD
  const { password } = req.body;
  if (password === undefined)
    return res.status(400).json({ msg: 'Please provide a valid password!' });

  // GET USER FROM THE RESET TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // CHECK IF THE TOKEN IS NOT EXPIRED
    if (!user) {
      return res.status(400).json({
        msg:
          'The token seems to be invalid or expired, please generate a new password reset link!',
      });
    }

    // CHECK THE PASSWORD ENTERED BY THE USER IS NOT THE PREVIOUS PASSWORD
    const matchedPassword = await user.comparePasswords(
      password,
      user.password
    );
    if (matchedPassword)
      return res
        .status(400)
        .json({ msg: 'Please enter a password that was not previously used!' });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // SEND THE TOKEN
    createAndSendToken(user, req, res);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   PATCH api/users/changePassword
// @desc    Change the user's password if they are currently logged in
// @access  Private
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // RETURN IF USER NOT FOUND
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found!' });

    // RETURN IF THE CURRENT PASSWORD DO NOT MATCH
    const matched = await user.comparePasswords(currentPassword, user.password);
    if (!matched)
      return res.status(401).json({ msg: 'Current password is not correct!' });

    // RETURN IF THE PROVIDED PASSWORDS CONFLICT
    const newPwdMatched = await user.comparePasswords(
      newPassword,
      user.password
    );
    if (newPwdMatched)
      return res
        .status(400)
        .json({ msg: "Please enter a password that you haven't used before!" });

    // CHANGE THE PASSWORD IF EVERYTHING WAS CORRECT
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // SEND THE TOKEN
    createAndSendToken(user, req, res);
  } catch (error) {
    handleServerError(res, err);
  }
};

// @route   PATCH api/users
// @desc    Update user
// @access  Private
exports.updateUser = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // RETURN IF THE USER HAS PROVIDED THE PASSWORD
  if (req.body.password) {
    return res.status(400).json({
      msg:
        'This route is not for updating password! Please use updatePassword!',
    });
  }

  // FIND THE USER BASED ON THE TOKEN
  let user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  // VERIFY FIELDS THAT ARE TYPED BY THE USER
  let { name, email, dateofbirth, height, weight, gender, bio } = req.body;

  name = !name ? user.name : name;
  height = !height ? user.height : height;
  weight = !weight ? user.weight : weight;
  bio = !bio ? user.bio : bio;

  try {
    let updatedUserBody = {
      name,
      email,
      dateofbirth,
      height,
      weight,
      gender,
      bio,
    };

    let updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updatedUserBody,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   DELETE api/users
// @desc    Delete user
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    // VERIFY IF THE USER EXISTS
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'No such user exists!' });

    // DELETE THE USER AND THE CORRESPONDING MOOD PROFILE
    await User.findByIdAndRemove(req.user.id);
    await Mood.findOneAndRemove({ user: req.user.id });

    res.status(204).json({ msg: 'User deleted!' });
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   PATCH api/users/follow/:userid
// @desc    Follow a user
// @access  Private
exports.followUser = async (req, res) => {
  try {
    // GET THE USER TO BE FOLLOWED
    let followingUser = await User.findById(req.params.userid);
    if (!followingUser)
      return res.status(404).json({ msg: 'User does not exist!' });

    // GET THE LOGGED IN USER
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User does not exist!' });

    // VERIFY THE USER IS NOT FOLLOWING SELF
    if (req.params.userid.toString() === req.user.id.toString()) {
      return res.status(400).json({ msg: "You can't follow yourself!" });
    }

    // VERIFY IF THE USER IS ALREADY FOLLOWING
    if (
      followingUser.followers.filter(
        (user) => user.toString() === req.user.id.toString()
      ).length > 0
    ) {
      return res
        .status(400)
        .json({ msg: 'You are already following this user!' });
    }

    followingUser.followers.unshift(user);
    user.following.unshift(followingUser);

    await followingUser.save();
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User does not exist!' });
    }
    handleServerError(res, err);
  }
};

// @route   PATCH api/users/unfollow/:userid
// @desc    Unfollow a user
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    // GET THE USER TO BE FOLLOWED
    let followingUser = await User.findById(req.params.userid);
    if (!followingUser)
      return res.status(404).json({ msg: 'User does not exist!' });

    // GET THE LOGGED IN USER
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User does not exist!' });

    // VERIFY THE USER IS NOT FOLLOWING SELF
    if (req.params.userid.toString() === req.user.id.toString()) {
      return res.status(400).json({ msg: "You can't follow yourself!" });
    }

    // VERIFY IF THE USER IS ALREADY FOLLOWING
    if (
      followingUser.followers.filter(
        (user) => user.toString() === req.user.id.toString()
      ).length === 0
    ) {
      return res.status(400).json({ msg: 'You are not following this user!' });
    }

    // GET THE REMOVE INDEX AND REMOVE THE USER FROM THE FOLLOWING USERS
    let removeIndexFollowing = followingUser.followers
      .map((user) => user)
      .indexOf(req.user.id);
    followingUser.followers.splice(removeIndexFollowing, 1);

    // GET THE REMOVE INDEX AND REMOVE THE USER FROM THE LOGGED IN USER
    let removeIndexLogged = user.following
      .map((user) => user)
      .indexOf(req.params.userid);
    user.following.splice(removeIndexLogged, 1);

    await user.save();
    await followingUser.save();

    res.status(200).json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User does not exist!' });
    }
    handleServerError(res, err);
  }
};
