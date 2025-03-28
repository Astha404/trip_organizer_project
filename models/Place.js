const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },  // e.g., 'Historical', 'Nature', 'Adventure'
    location: { type: String, required: true },
    rating: { type: Number, default: 0 }, // Rating out of 5
    image: { type: String }, // Image URL
});

module.exports = mongoose.model("Place", PlaceSchema);
