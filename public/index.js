const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const Booking = require("../models/booking");
const Review = require("../models/review");
const Contact = require("../models/contact");
const User = require("../models/user");

dotenv.config(); // Load environment variables

const app = express();
const PORT = 8000;
const SECRET_KEY = process.env.SECRET_KEY || "default_secret";

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/triporganizer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// 🟢 User Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    // ❌ Remove hashing (Ensure this is not used)
    // const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save plain password
    const newUser = new User({ name, email, password });

    // Save user to DB
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully!", 
      user: { name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Error signing up", error: error.message });
  }
});

//🟢 Login  Route

app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      console.log("Entered Password:", password);
      console.log("Stored Password from DB:", user.password);

      // ❌ Removed bcrypt.compare() - Directly compare passwords
      if (password !== user.password) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Generate JWT token (optional)
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });

      res.json({
          success: true,
          message: "Login successful",
          token,
          user: { name: user.name, email: user.email }
      });

  } catch (error) {
      res.status(500).json({ success: false, message: "Error logging in", error });
  }
});


// 🟢 Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating password", error });
  }
});

// 🟢 Booking Route
app.post("/book", async (req, res) => {
  try {
    const newEntry = new Booking(req.body);
    await newEntry.save();
    res.json({ success: true, message: "Details saved!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving data", error });
  }
});

// 🟢 Review Routes
app.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find(); // Fetch all reviews from MongoDB
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
});

// 🟢 POST route for adding a new review
app.post("/reviews", async (req, res) => {
    try {
        const { name, email, description } = req.body; // Extract review details
        const newReview = new Review({ name, email, description });
        await newReview.save();
        res.status(201).json({ success: true, message: "Review submitted successfully!" });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ success: false, message: "Error submitting review" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
