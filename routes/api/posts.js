const { Router } = require('express');
const express = require('express');
const { check } = require('express-validator');

const auth = require('../../middleware/auth');
const postController = require('../../controller/postController');

const router = express.Router();

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getAllPosts);

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Please write something to post!').not().isEmpty()]],
  postController.createPost
);

// @route   PATCH api/posts/:postid
// @desc    Update a post
// @access  Private
router.patch(
  '/:postid',
  [auth, [check('text', 'Please write something to post!').not().isEmpty()]],
  postController.updatePost
);

// @route   DELETE api/posts/:postid
// @desc    Delete a post
// @access  Private
router.delete('/:postid', auth, postController.deletePost);

// @route   PUT api/posts/like/:postid
// @desc    Like a post
// @access  Private
router.put('/like/:postid', auth, postController.likePost);

// @route   PUT api/posts/unlike/:postid
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:postid', auth, postController.unlikePost);

// @route   PATCH api/posts/report/:postid
// @desc    Report a post
// @access  Private
router.patch('/report/:postid', auth, postController.reportPost);

module.exports = router;
