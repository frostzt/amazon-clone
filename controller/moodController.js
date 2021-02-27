const Mood = require('../models/Mood');

// @route   POST api/mood
// @desc    Create mood for user
// @access  Private
exports.createMood = async (req, res) => {
  // BUILD MOOD OBJECT
  const mood = {
    user: req.user.id,
  };

  try {
    // CREATE MOOD
    let userMood = new Mood(mood).populate('user', ['name', 'email']);
    await userMood.save();

    res.status(200).json(userMood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! We're working on it!" });
  }
};

// @route   PUT api/mood/curMood
// @desc    Take current mood from the user
// @access  Private
exports.getCurrentMood = async (req, res) => {
  const { time, mood } = req.body;
  const newCurMood = { time, mood };

  try {
    const userMood = await Mood.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'email']
    );
    userMood.curMood.unshift(newCurMood);

    userMood.save();
    res.status(200).json(userMood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! We're working on it!" });
  }
};

// @route   GET api/mood
// @desc    Get all moods of all users
// @access  Public
exports.getAllMoods = async (req, res) => {
  try {
    const moods = await Mood.find().populate('user', ['name', 'email']);
    res.status(200).json(moods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error! We're working on it!" });
  }
};
