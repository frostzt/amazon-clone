const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const productController = require('../../controller/productController');
const auth = require('../../middleware/auth');
