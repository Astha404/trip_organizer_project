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
    },
    date: { 
        type: Date, 
        default: Date.now,

     }
});



const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;



