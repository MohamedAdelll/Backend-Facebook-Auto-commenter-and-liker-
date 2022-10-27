const validate = require("../middlewares/validate"); // validate middleware
const authenticate = require("../middlewares/authenticate");
const schemas = require("../validations/Users"); // validations
const express = require("express");
const {
  index,
  listForExtension,
  create,
  login,
  getUpdate,
  update,
  deleteUser,
  changePassword,
  updateProfileImage,
} = require("../controllers/Users");
const router = express.Router();

router.route("/").get(authenticate, index);
router.route("/list").get(authenticate, listForExtension);
router.route("/").post(authenticate, create);
// router.route("/").post(authenticate, create);
router.route("/:id").get(authenticate, getUpdate);
router
  .route("/")
  .patch(authenticate, validate(schemas.updateValidation), update);
router.route("/login").post(validate(schemas.loginValidation), login);
router.route("/change-password").post(authenticate, changePassword);
router.route("/update-profile-image").post(authenticate, updateProfileImage);
router.route("/:id").delete(authenticate, deleteUser);

module.exports = router;
