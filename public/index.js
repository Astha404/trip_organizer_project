const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const sendResetEmail = require("../config/mailer");

// Models
const Itinerary = require("../models/itinerary");
const Booking = require("../models/booking");
const Review = require("../models/review");
const Contact = require("../models/contact");
const User = require("../models/user");

// Load environment variables
dotenv.config();

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

// Routes
const itineraryRoutes = require("../routes/itineraryRoutes");
app.use("/itinerary", itineraryRoutes);

// 🟢 **Get User Itinerary**
app.get("/itinerary/:userEmail", async (req, res) => {
  try {
      const { userEmail } = req.params;
      const itinerary = await Itinerary.findOne({ userEmail });

      if (!itinerary) {
          return res.json({ success: true, itinerary: { places: [] } });
      }

      res.json({ success: true, itinerary });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching itinerary", error });
  }
});

// 🟢 **Add Activity**
app.post("/itinerary/add", async (req, res) => {
  try {
      const { userEmail, name } = req.body;
      let itinerary = await Itinerary.findOne({ userEmail });

      if (!itinerary) {
          itinerary = new Itinerary({ userEmail, places: [{ name, status: "pending" }] });
      } else {
          itinerary.places.push({ name, status: "pending" });
      }

      await itinerary.save();
      res.json({ success: true, message: "Activity added!", itinerary });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error adding activity", error });
  }
});

// 🟢 **Update Activity Status**
app.post("/itinerary/update-status", async (req, res) => {
  try {
      const { activityId, status } = req.body;
      const validStatuses = ["Pending", "Finish", "Skip"];

      if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: "Invalid status!" });
      }

      const itinerary = await Itinerary.findOneAndUpdate(
          { "places._id": activityId },
          { $set: { "places.$.status": status } },
          { new: true }
      );

      if (!itinerary) {
          return res.status(404).json({ success: false, message: "Activity not found" });
      }

      res.json({ success: true, message: "Status updated!", itinerary });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error updating status", error });
  }
});

// 🟢 **Delete Activity**
app.post("/itinerary/delete", async (req, res) => {
  try {
      const { activityId } = req.body;

      const itinerary = await Itinerary.findOneAndUpdate(
          { "places._id": activityId },
          { $pull: { places: { _id: activityId } } },
          { new: true }
      );

      if (!itinerary) {
          return res.status(404).json({ success: false, message: "Activity not found" });
      }

      res.json({ success: true, message: "Activity deleted!", itinerary });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting activity", error });
  }
});



// 🟢 User Signup Route (Without Hashing)
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully!", 
      user: { name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error signing up", error: error.message });
  }
});

// 🟢 User Login Route (Without Hashing)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
});

// 🟢 Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    await sendResetEmail(email, resetToken);
    res.json({ success: true, message: "Password reset email sent!" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending reset email", error });
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
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
});

// 🟢 POST route for adding a new review
app.post("/reviews", async (req, res) => {
  try {
      const { name, email, description } = req.body;

      if (!name || !email) {
          return res.status(401).json({ success: false, message: "Unauthorized! Please log in to submit a review." });
      }

      const newReview = new Review({ 
          name, 
          email, 
          description,
          date: new Date() 
      });

      await newReview.save();
      res.status(201).json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error submitting review" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
