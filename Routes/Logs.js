const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { getAllLogsByUser, createLog } = require("../controllers/Logs");
const router = express.Router();

router.route("/").get(authenticate, getAllLogsByUser);
router.route("/").post(authenticate, createLog);

module.exports = router;
