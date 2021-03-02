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

// @route   PATCH api/product/:productId
// @desc    Edit a product
// @access  Vendor
router.patch('/:productId', auth, productController.editProduct);

// @route   GET api/product/my-products
// @desc    Get all products by the vendor
// @access  Vendor
router.get('/my-products', auth, productController.getAllProductsByMe);

// @route   DELETE api/product/:productId
// @desc    Delete a product
// @access  Vendor
router.delete('/:productId', auth, productController.deleteProduct);

module.exports = router;
