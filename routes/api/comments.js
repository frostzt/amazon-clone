const express = require('express');
const { check } = require('express-validator');

const auth = require('../../middleware/auth');
const commentController = require('../../controller/commentController');

const router = express.Router();

// @route   GET api/comments/
// @desc    Get all comments
// @access  Public
router.get('/', commentController.getAllComments);

// @route   POST api/comments/:postid
// @desc    Create a new comment on a post
// @access  Private
router.post(
  '/:postid',
  [auth, [check('text', 'A comment must contain some text!').not().isEmpty()]],
  commentController.createComment
);

// @route   PATCH api/comments/:postid/:commentid
// @desc    Edit a comment on a post
// @access  Private
router.patch(
  '/:postid/:commentid',
  [auth, [check('text', 'A comment must contain some text!').not().isEmpty()]],
  commentController.editComment
);

// @route   DELETE api/comments/:postid/:commentid
// @desc    Delete a comment
// @access  Private
router.delete('/:postid/:commentid', auth, commentController.deleteComment);

// @route   POST api/comments/reply/:postid/:commentid
// @desc    Create a new comment on a post
// @access  Private
router.post(
  '/reply/:postid/:commentid',
  [auth, [check('text', 'Write something to reply!').not().isEmpty()]],
  commentController.createReply
);

module.exports = router;
