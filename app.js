const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const loaders = require("./loaders");
const { UserRoutes, LogRoutes, ScheduleEngageRoutes } = require("./Routes");
const path = require("path");

global.Helper = require("./scripts/utils/helper");

loaders();

const app = express();
const prefix = "";
//http://localhost:3000/uploads/users/6288c70712a140a27b62bcc7.png
app.use(
  prefix + "/uploads",
  express.static(path.join(__dirname, "./", "uploads"))
);
var corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet());

app.listen(process.env.APP_PORT, () => {
  console.log("Server is listening...");
  app.use(prefix + "/users", UserRoutes);
  app.use(prefix + "/logs", LogRoutes);
  app.use(prefix + "/schedule-engage", ScheduleEngageRoutes);
});
