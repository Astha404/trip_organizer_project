const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
});

// Model name should start with uppercase
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
