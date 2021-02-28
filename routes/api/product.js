const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const productController = require('../../controller/productController');
const auth = require('../../middleware/auth');

// @route   GET api/product
// @desc    Get all products
// @access  Admin
router.get('/', auth, productController.getAllProducts);

// @route   POST api/product
// @desc    Create a product
// @access  Vendor
router.post(
  '/',
  [
    auth,
    [
      check('name', 'A product must have a name!').not().isEmpty(),
      check('price', 'A price must be present and be a number!')
        .not()
        .isEmpty()
        .isNumeric(),
      check('stock', 'Please define the stock of product available!')
        .not()
        .isEmpty(),
      check('description', 'A product must have a description').not().isEmpty(),
    ],
  ],
  productController.createProduct
);

module.exports = router;
