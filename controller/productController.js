const { validationResult } = require('express-validator');

const Product = require('../models/Product');
const User = require('../models/User');
const { handleServerError } = require('../utils/utilHandler');

// Filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// @route   GET api/product
// @desc    Get all products
// @access  Admin
exports.getAllProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'admin') {
      return res
        .status(401)
        .json({ msg: 'Sorry! This feature is only allowed for admins!' });
    }

    const products = await Product.find();
    return res.status(200).json(products);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   GET api/product/my-products
// @desc    Get all products by the vendor
// @access  Vendor
exports.getAllProductsByMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Sorry this user no longer exists!' });
    }

    if (user.role !== 'vendor') {
      return res
        .status(401)
        .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
    }

    const myProducts = await Product.find({ vendor: req.user.id });

    return res.status(200).json(myProducts);
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
    return res
      .status(401)
      .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
  }

  try {
    const { name, price, stock, description, images } = req.body;

    const vendor = req.user.id;

    const product = new Product({
      name,
      price,
      stock,
      vendor,
      description,
      images,
    });

    await product.save();
    return res.status(200).json(product);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   PATCH api/product/:pro`ductId
// @desc    Edit a product
// @access  Vendor
exports.editProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let currentProduct = await Product.findById(req.params.productId);

    if (user.role !== 'vendor') {
      return res
        .status(401)
        .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
    }

    if (currentProduct.vendor.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ msg: 'You can only edit your own products!' });
    }

    let filteredProduct = filterObj(req.body, [
      'name',
      'price',
      'stock',
      'vendor',
      'description',
      'images',
    ]);

    currentProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      filteredProduct,
      {
        new: true,
      }
    );

    return res.status(200).json(currentProduct);
  } catch (err) {
    console.error(err);
    handleServerError(res, err);
  }
};

// @route   DELETE api/product/:productId
// @desc    Delete a product
// @access  Vendor
exports.deleteProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const currentProduct = await Product.findById(req.params.productId);

    if (!user) {
      return res.status(404).json({ msg: 'Sorry this user no longer exists!' });
    }

    if (user.role !== 'vendor') {
      return res
        .status(401)
        .json({ msg: 'Sorry! This feature is only allowed for vendors!' });
    }

    if (currentProduct.vendor.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ msg: 'You can only delete your own products!' });
    }

    await Product.findByIdAndDelete(req.params.productId);
    return res.status(204).json({ msg: 'Product deleted!' });
  } catch (err) {
    console.error(err);
    handleServerError(res, err);
  }
};
