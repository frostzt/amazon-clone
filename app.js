const express = require('express');
const morgan = require('morgan');

// ROUTES
const authRoute = require('./routes/api/auth');
const usersRoute = require('./routes/api/users');
const productRoute = require('./routes/api/product');

const app = express();

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// BODY PARSER, READING DATA FROM REQ.BODY
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// DEFINE ROUTES
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/product', productRoute);

module.exports = app;
