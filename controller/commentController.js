const { validationResult } = require('express-validator');

const Comment = require('../models/Comment');
const Post = require('../models/Post');
const {
  handleServerError,
  verifyAuthorityOnContent,
} = require('../utils/utilHandler');

// @route   GET api/comments/
// @desc    Get all comments
// @access  Public
exports.getAllComments = async (req, res) => {
  try {
    let comments = await Comment.find()
      .populate('post', ['user', 'text'])
      .populate('user', ['name', 'email']);
    res.status(200).json(comments);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   POST api/comments/:postid
// @desc    Create a new comment on a psot
// @access  Private
exports.createComment = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // GET THE POST
    let post = await Post.findById(req.params.postid);
    if (!post) return res.status(404).json({ msg: 'Post does not exist!' });

    // CREATE A COMMENT AND PUT IT IN THE POST
    let userComment = new Comment({
      post: req.params.postid,
      user: req.user.id,
      text: req.body.text,
    });

    post.comments.unshift({ comment: userComment });

    await userComment.save();
    await post.save();

    res.status(200).json(userComment);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   PATCH api/comments/:postid/:commentid
// @desc    Edit a comment on a post
// @access  Private
exports.editComment = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let post = await Post.findById(req.params.postid);
    let userComment = await Comment.findById(req.params.commentid);
    if (!post) return res.status(404).json({ msg: 'Post does not exist!' });

    // VERIFY THE USER
    if (verifyAuthorityOnContent(userComment.user, req.user.id)) {
      return res
        .status(401)
        .json({ msg: 'Comment does not belong to this user!' });
    }

    // CHECK IF THE COMMENT EXISTS
    if (!userComment)
      return res.status(404).json({ msg: 'Comment does not exist!' });

    let updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentid,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such comment or post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   DELETE api/comments/:postid/:commentid
// @desc    Delete a comment
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    let post = await Post.findById(req.params.postid);
    let userComment = await Comment.findById(req.params.commentid);
    if (!post) return res.status(404).json({ msg: 'Post does not exist!' });

    // CHECK IF THE COMMENT EXISTS
    if (!userComment)
      return res.status(404).json({ msg: 'Comment does not exist!' });

    // VERIFY THE USER AND THE OWNER
    if (
      !(req.user.id.toString() === post.user.toString()) &&
      !(req.user.id.toString() === userComment.user.toString())
    ) {
      return res.status(401).json({ msg: 'You cannot delete this comment!' });
    }

    // GET THE INDEX OF THE COMMENT
    const removeIndex = post.comments
      .map((comment) => comment.comment.toString())
      .indexOf(req.params.commentid);

    // REMOVE THE COMMENT FROM THE POST AND THE DB
    post.comments.splice(removeIndex, 1);
    await Comment.findByIdAndRemove(req.params.commentid);
    await post.save();

    res.status(200).json({ msg: 'Comment deleted!' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such comment or post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   POST api/comments/reply/:postid/:commentid
// @desc    Create a new comment on a post
// @access  Private
exports.createReply = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // GET THE POST
    const post = await Post.findById(req.params.postid);
    if (!post) return res.status(404).json({ msg: 'Post does not exist!' });

    // CHECK IF THE COMMENT EXISTS
    const comment = await Comment.findById(req.params.commentid);
    if (!comment)
      return res.status(404).json({ msg: 'Comment does not exist!' });

    // CREATE REPLY ON COMMENT
    const reply = new Comment({
      post: req.params.postid,
      user: req.user.id,
      text: req.body.text,
    });

    comment.replies.unshift(reply);
    await reply.save();
    await comment.save();
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};
