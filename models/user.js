const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plain text password
  resetToken: String,
  resetTokenExpiry: Date
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
