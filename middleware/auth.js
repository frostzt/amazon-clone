const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = async function (req, res, next) {
  // GET TOKEN FROM HEADER
  const token = req.header('x-auth-token');

  // CHECK IF TOKEN EXISTS
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWTSECRET);

    // CHECK IF THE USER EXISTS
    const curUser = await User.findById(decoded.user.id);
    if (!curUser) {
      return res.status(401).json({ msg: 'This user no longer exists!' });
    }

    // CHECK FOR PASSWORD CHANGE AFTER THE TOKEN ISSUE
    if (curUser.changedPasswordAfter(decoded.iat)) {
      return res
        .status(401)
        .json({ msg: 'User recently changed password, please relogin!' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is invalid' });
  }
};
