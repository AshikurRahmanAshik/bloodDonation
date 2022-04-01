const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const userRouter = require("./routers/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/user", userRouter);

app.all(`*`, (req, res, next) => {
  res.status(404).json({
    message: "Path not Found on this Server",
  });
});

module.exports = app;
