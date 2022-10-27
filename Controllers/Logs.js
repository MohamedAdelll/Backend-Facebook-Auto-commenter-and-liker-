const Logs = require("../models/Logs");
const httpStatus = require("http-status");
const { createIndexes } = require("../models/Logs");

async function getAllLogsByUser(req, res) {
  try {
    const { user } = req;
    const user_id = user._id;
    let { page } = req.query || 1;
    let { limit } = req.query;
    (page = +page), (limit = +limit);
    const skip = (page - 1) * limit;
    let logs;
    let data;
    if (!limit) {
      logs = await Logs.find({ user_id }).sort({ createdAt: -1 });
      const totalLength = logs.length;
      const reactionLength = logs.filter((log) => log.like).length;
      const commentLength = totalLength - reactionLength;
      const currSession = logs[0]?.session.toHexString() || null;
      const lastSessionLength =
        currSession === null
          ? 0
          : logs.filter((log) => log.session.toHexString() === currSession)
              .length;
      const topReaction = getTopReaction(logs);
      data = {
        topReaction,
        lastSessionLength,
        reactionLength,
        commentLength,
      };
    } else {
      logs = await Logs.find({ user_id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      data = { logs };
    }

    res.status(200).json({
      message: "success",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function createLog(req, res) {
  try {
    const { engagedWith, comment, like, topReaction, session } = req.body;
    const newLog = await Logs.create({
      engagedWith,
      comment,
      like,
      topReaction,
      session,
      user_id: req.user._id,
    });
    res.status(201).json({
      status: "success",
      data: {
        log: newLog,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

function getTopReaction(logs) {
  const obj = { like: 0, wow: 0, sad: 0, love: 0, angry: 0, care: 0, haha: 0 };
  logs.forEach((log) => obj[log.topReaction]++);
  return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
}

module.exports = {
  getAllLogsByUser,
  createLog,
};
