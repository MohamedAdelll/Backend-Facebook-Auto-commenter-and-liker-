const ScheduleEngage = require("../models/ScheduleEngage");
const httpStatus = require("http-status");
const schedule = require("node-schedule");

async function scheduleAnEngagement(req, res) {
  try {
    const { user } = req;
    let { body } = req;
    const { token } = body;
    const { haha, like, love, care, sad, angry, wow, date, time, maxFriends } =
      body;
    const user_id = user._id;
    const scheduledDoc = await ScheduleEngage.create({
      maxFriends,
      haha,
      like,
      love,
      care,
      sad,
      angry,
      wow,
      date,
      time,
      user_id,
    });
    const session = scheduledDoc._id;
    body = { ...body, token, session };
    await scheduleNow(body);
    res.status(201).json({
      status: "success",
      message: "Scheduled an engagement",
      data: { scheduledDoc },
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function getScheduleByUser(req, res) {
  try {
    const { user } = req;
    const user_id = user._id;
    const scheduledDoc = await ScheduleEngage.find({ user_id });
    res.status(200).json({
      status: "success",
      data: { scheduledDoc },
    });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function deleteSchedule(req, res) {
  try {
    const { user } = req;
    const user_id = user._id;
    await ScheduleEngage.findOneAndDelete({ user_id });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
  }
}

async function scheduleNow(body) {
  const { date, time } = body;
  const { like, wow, haha, love, angry, sad, care } = body;
  const { session } = body;
  const { token } = body;
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const dateScheduled = new Date(+year, +month - 1, +day, +hour, +minute, 0);
  const obj = {
    timeBetweenEngagement: body.timeBetweenEngagement,
    maxFriends: body.maxFriends,
    reactsObj: { like, wow, haha, love, angry, sad, care },
    cred: { token, session },
  };
  schedule.scheduleJob(dateScheduled, async function () {
    require("./engage")(obj);
  });
}

module.exports = {
  deleteSchedule,
  getScheduleByUser,
  scheduleAnEngagement,
};
