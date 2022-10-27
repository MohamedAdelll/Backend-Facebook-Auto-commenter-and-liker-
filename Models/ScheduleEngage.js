const Mongoose = require("mongoose");

const ScheduleEngageSchema = new Mongoose.Schema(
  {
    like: [String],
    haha: [String],
    love: [String],
    care: [String],
    sad: [String],
    angry: [String],
    wow: [String],
    maxFriends: Number,
    date: String,
    time: String,
    user_id: {
      type: Mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = Mongoose.model("scheduleEngage", ScheduleEngageSchema);
