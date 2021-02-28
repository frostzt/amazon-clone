const { validationResult } = require('express-validator');

const Product = require('../models/Product');
const { handleServerError } = require('../utils/utilHandler');

// @route   GET api/product
// @desc    Get all products
// @access  Admin
exports.getAllProducts = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res
        .status(401)
        .json({ msg: 'Sorry! This feature is only allowed for admins!' });
    }

    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   POST api/product
// @desc    Create a product
// @access  Vendor
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.user !== 'vendor') {
    return res
      .status(401)
      .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
  }
};
