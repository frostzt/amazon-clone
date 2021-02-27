const express = require('express');

const auth = require('../../middleware/auth');
const moodController = require('../../controller/moodController');

const router = express.Router();

// @route   GET api/mood
// @desc    Get all moods of all users
// @access  Public
router.get('/', moodController.getAllMoods);

// @route   POST api/mood
// @desc    Create mood for user
// @access  Private
router.post('/', auth, moodController.createMood);

// @route   PUT api/mood/curMood
// @desc    Take current mood from the user
// @access  Private
router.put('/curMood', auth, moodController.getCurrentMood);

module.exports = router;
