const { validationResult } = require('express-validator');

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const {
  handleServerError,
  verifyAuthorityOnContent,
} = require('../utils/utilHandler');

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['name', 'email'])
      .populate('comment', ['user', 'text']);
    res.status(200).json(posts);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   POST api/posts
// @desc    Create a post
// @access  Private
exports.createPost = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { text } = req.body;

  try {
    let post = new Post({
      user: req.user.id,
      text,
    });

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    handleServerError(res, err);
  }
};

// @route   DELETE api/posts/:postid
// @desc    Delete a post
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    // CHECK IF THE POST EXISTS
    let post = await Post.findById(req.params.postid);
    if (!post) {
      return res.status(404).json({ msg: 'No such post exists!' });
    }

    // CHECK IF THE USER IS THE USER THAT CREATED THE POST
    if (verifyAuthorityOnContent(post.user, req.user.id)) {
      return res
        .status(401)
        .json({ msg: 'Sorry this post does not belong to this user!' });
    }

    await Post.findByIdAndRemove(req.params.postid);
    await Comment.deleteMany({ post: req.params.postid });

    res.status(204).json({ msg: 'Post deleted!' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   PATCH api/posts/:postid
// @desc    Update a post
// @access  Private
exports.updatePost = async (req, res) => {
  // VALIDATE ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // CHECK IF THE POST EXISTS
  let post = await Post.findById(req.params.postid);
  if (!post) {
    return res.status(404).json({ msg: 'No such post exists!' });
  }

  // CHECK IF THE USER IS THE USER THAT CREATED THE POST
  if (verifyAuthorityOnContent(post.user, req.user.id)) {
    return res
      .status(401)
      .json({ msg: 'Sorry this post does not belong to this user!' });
  }

  try {
    let updatedPost = await Post.findByIdAndUpdate(
      req.params.postid,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   PUT api/posts/like/:postid
// @desc    Like a post
// @access  Private
exports.likePost = async (req, res) => {
  try {
    // CHECK IF THE USER HAS ALREADY LIKE THE POST
    let post = await Post.findById(req.params.postid);
    if (!post) return res.status(404).json({ msg: 'No such post exists!' });
    if (
      post.like.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked!' });
    }

    // ADD USER TO THE LIKE LIST
    post.like.unshift({ user: req.user.id });
    await post.save();

    res.status(200).json(post.like);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   PUT api/posts/unlike/:postid
// @desc    Unlike a post
// @access  Private
exports.unlikePost = async (req, res) => {
  try {
    // CHECK IF THE USER HAS ALREADY LIKE THE POST
    let post = await Post.findById(req.params.postid);
    if (!post) return res.status(404).json({ msg: 'No such post exists!' });
    if (
      post.like.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post not liked!' });
    }

    // GET THE INDEX OF THE LIKE
    const removeIndex = post.like
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    // REMOVE THE USER AND SAVE
    post.like.splice(removeIndex, 1);
    await post.save();

    res.status(200).json(post.like);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};

// @route   PATCH api/posts/report/:postid
// @desc    Report a post
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.postid);
    if (!post) return res.status(404).json({ msg: 'No such post exists!' });

    let reportCount = post.report + 1;
    let updatedCount = {
      report: reportCount,
    };

    let updatedPost = await Post.findByIdAndUpdate(
      req.params.postid,
      updatedCount,
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'No such post exists!' });
    }
    handleServerError(res, err);
  }
};
