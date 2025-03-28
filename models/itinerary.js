const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    places: [
        {
            name: String,
            status: { type: String, enum: ["pending", "visited", "skipped"], default: "pending" }
        }
    ]
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);
module.exports = Itinerary;
