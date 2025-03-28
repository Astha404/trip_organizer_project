const express = require("express");
const crypto = require("crypto");
const User = require("../models/user");
const sendResetEmail = require("../config/mailer");
const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Generate reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await sendResetEmail(email, resetLink);

    res.json({ success: true, message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: Date.now() } // Ensure token is not expired
      });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }
  
      // Update password without hashing
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
  
      await user.save();
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error resetting password" });
    }
  });
  
  

module.exports = router;
