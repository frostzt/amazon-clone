const { validationResult } = require('express-validator');

const Product = require('../models/Product');
const User = require('../models/User');
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

  const user = await User.findById(req.user.id);

  if (user.role !== 'vendor') {
    console.log(req.user);
    return res
      .status(401)
      .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
  }

  try {
    const {
      name,
      price,
      stock,
      description,
      ratingsQuantity,
      ratingsAverage,
      images,
    } = req.body;

    const vendor = req.user.id;

    const product = new Product({
      name,
      price,
      stock,
      vendor,
      description,
      ratingsQuantity,
      ratingsAverage,
      images,
    });

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    handleServerError(res, err);
  }
};
