const mongoose = require('mongoose');

let MoodSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  curMood: [
    {
      time: {
        type: Date,
        default: Date.now,
      },
      mood: {
        type: String,
        default: '',
      },
    },
  ],
  avgDayMood: [
    {
      type: String,
      default: '',
    },
  ],
  avgWeekMood: [
    {
      type: String,
      default: '',
    },
  ],
  avgMonthMood: [
    {
      type: String,
      default: '',
    },
  ],
});

module.exports = Mood = mongoose.model('mood', MoodSchema);
