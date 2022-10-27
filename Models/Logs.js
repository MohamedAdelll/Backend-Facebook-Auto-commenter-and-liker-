const Mongoose = require("mongoose");

const LogSchema = new Mongoose.Schema(
  {
    user_id: {
      type: Mongoose.Types.ObjectId,
      ref: "user",
    },
    comment: String,
    like: Boolean,
    topReaction: String,
    engagedWith: String,
    session: {
      type: Mongoose.Types.ObjectId,
      ref: "scheduleEngage",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = Mongoose.model("Log", LogSchema);
