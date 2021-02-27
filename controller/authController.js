const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');

// @route   GET api/auth
// @desc    Verify user (route to be hit by the client for regular verification)
// @access  Public
exports.getUser = async (req, res) => {
  try {
    // Verify the user exists in the DB
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! We're working on it!" });
  }
};

// @route   POST api/auth
// @desc    Authenticate user and sign in
// @access  Public
exports.signIn = async (req, res) => {
  // Check and validate errors
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials!' });

    // Check if the password is correct
    const matched = await user.comparePasswords(password, user.password);
    if (!matched) return res.status(400).json({ msg: 'Invalid credentials!' });

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error, we are working on it!' });
  }
};
