const mongoose = require('mongoose');

let ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  stock: {
    type: Number,
    min: 0,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  description: {
    type: String,
    required: true,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  ratingsAverage: {
    type: Number,
    default: 3,
    min: [1.0, 'Rating must be above 1.0'],
    max: [5.0, 'Rating must be below 5.0'],
  },
  images: [String],
});

module.exports = Product = mongoose.model('product', ProductSchema);
