const httpStatus = require("http-status");
const JWT = require("jsonwebtoken");
const User = require("../models/Users");
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ error: "You must be logged in for this operation." });
  }
  JWT.verify(
    token.split(" ")[1],
    process.env.ACCESS_TOKEN_SECRET_KEY,
    async (err, user) => {
      if (err)
        return res
          .status(httpStatus.FORBIDDEN)
          .send({ error: "Token Expired." });
      const isUser = await User.findOne({ _id: user?._doc._id });
      const invalid =
        !isUser || isUser.lastLoginDate > user?._doc.lastLoginDate;
      if (invalid) {
        res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "You must be logged in for this operation." });
      } else {
        req.user = user?._doc;
        next();
      }
    }
  );
};
module.exports = authenticateToken;
