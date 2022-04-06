const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

const sendResponse = (statusCode, message, res, error = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.log(error, "INSIDE");
    res.status(400).json({
      status: statusCode,
      message,
      error,
    });
  } else {
    res.status(400).json({
      status: statusCode,
      message,
    });
  }
};

const messPre = ({ errors = {} }) => {
  let msg = "";
  if (Object.keys(errors).length > 0) {
    msg = errors[Object.keys(errors)[0]].message;
  } else msg = "Something Went Wrong";
  return msg;
};

exports.saveUser = async (req, res) => {
  req.body = {
    ...req.body,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  };
  try {
    const isExist = await User.findOne({ phone: req.body.phone });
    if (isExist) {
      return sendResponse(
        400,
        "Phone Number is already exist, Please use different one!",
        res
      );
    }
    if (!req.body.hasOwnProperty("point")) {
      return sendResponse(400, "Please Provide location", res);
    }
    if (
      req.body.point.length < 2 ||
      req.body.point[0] < -90 ||
      req.body.point[0] > 90 ||
      req.body.point[1] < -180 ||
      req.body.point[1] > 180
    ) {
      return sendResponse(400, "Please Provide Valid Location.", res);
    }
    req.body = {
      ...req.body,
      location: {
        type: "Point",
        coordinates: [...req.body.point],
      },
    };
    const user = await User.create(req.body);

    res.status(201).json({
      staus: "success",
      user,
      token: signToken(user._id),
    });
  } catch (err) {
    const error = { ...err };
    sendResponse(400, messPre(err), res, error);
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return sendResponse(400, "Please Provide Phone Number and Password!", res);
  }
  try {
    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.checkPassword(user.password, password))) {
      return sendResponse(
        400,
        "Please Provide valid Phone Number and Password!",
        res
      );
    }
    res.status(200).json({
      staus: "success",
      user,
      token: signToken(user._id),
    });
  } catch (err) {
    const error = { ...err };
    return sendResponse(400, messPre(err), res, error);
  }
};

exports.protected = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie?.split("=")[1]) {
      token = req.headers.cookie?.split("=")[1];
    }

    if (!token) {
      return sendResponse(400, "You are not logged in! please login.", res);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    console.log(decoded);
    const loggedInUser = await User.findById(decoded.id).select("+role");
    if (!loggedInUser) {
      return sendResponse(
        400,
        "The user belonging to this token does not exist",
        res
      );
    }

    req.user = loggedInUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return sendResponse(
        400,
        "Token is no longer valid. Please login again.",
        res,
        err
      );
    if (err.name === "JsonWebTokenError")
      return sendResponse(400, "Not a valid Token. Please login.", res, err);
    sendResponse(400, "Something Went Wrong.", res, err);
  }
};

const filterObj = (obj, allowedField) => {
  let newObj = {};
  for (let key in obj) {
    if (allowedField.includes(key)) {
      newObj = {
        ...newObj,
        [key]: obj[key],
      };
    }
  }

  return newObj;
};

exports.updateUser = async (req, res) => {
  const allowedField = ["name", "bloodGroup", "lastBloodDonationDate", "email"];
  const dymmyBody = { ...req.body };
  let filteredObj = filterObj(dymmyBody, allowedField);
  if (req.body.hasOwnProperty("point")) {
    if (
      req.body.point.length < 2 ||
      req.body.point[0] < -90 ||
      req.body.point[0] > 90 ||
      req.body.point[1] < -180 ||
      req.body.point[1] > 180
    ) {
      return sendResponse(400, "Please Provide Valid Location.", res);
    } else {
      filteredObj = {
        ...filteredObj,
        location: {
          type: "Point",
          coordinates: [...req.body.point],
        },
      };
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const user = await User.find({
      bloodGroup: req.query.bloodGroup,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [req.query.lat, req.query.lon],
          },
          $maxDistance: req.query.distance * 1000,
        },
      },
    }).select("-__v -status");

    res.status(200).json({
      staus: "success",
      user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getOneUser = async (req, res) => {
  console.log(req.params);
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(400, "User not found.", res);
    }
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    const error = { ...err };
    return sendResponse(400, messPre(err), res, error);
  }
};
