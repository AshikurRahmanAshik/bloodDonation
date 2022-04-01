const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Name is Required.`],
    trim: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: [true, `Phone Number is Required.`],
    unique: true,
    trim: true,
    minlength: [11, `Phone Number Not Less than 11 Number.`],
    maxlength: [11, "Phone Number Not more than 11 Number."],
  },
  bloodGroup: {
    type: String,
    required: [true, "Blood Group is required"],
    enum: {
      values: [`A+`, "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      message: "Not a Valid Blood Group",
    },
  },
  lastBloodDonationDate: {
    type: Date,
  },
  status: {
    type: Boolean,
    default: true,
    select: false,
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: [true, "Location is Required"],
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  password: {
    type: String,
    required: [true, `Password is Required.`],
    trim: true,
    minlength: [6, `Password must be at least 6 charecter.`],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, `Confirm password is required`],
    minlength: [6, "Confirm password contain at least 8 Charecter."],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Confirm password is not same as password.",
    },
  },
  role: {
    type: String,
    default: "user",
    required: [true, `Role is Required`],
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.index({ location: "2dsphere" });

userSchema.methods.checkPassword = async function (
  storedPassword,
  providedPassword
) {
  return await bcrypt.compare(providedPassword, storedPassword);
};

const User = mongoose.model("users", userSchema);
module.exports = User;
