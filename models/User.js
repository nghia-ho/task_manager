const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      default: "employee",
      enum: ["manager", "employee"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
