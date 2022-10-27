const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  getScheduleByUser,
  deleteSchedule,
  scheduleAnEngagement,
} = require("../controllers/ScheduleEngage");

const router = express.Router();

router.route("/").get(authenticate, getScheduleByUser);
router.route("/").post(authenticate, scheduleAnEngagement);
router.route("/").delete(authenticate, deleteSchedule);

module.exports = router;
