const express = require("express");
const router = express.Router();
const Itinerary = require("../models/itinerary");

// ✅ Save Itinerary
router.post("/add", async (req, res) => {
    try {
        const { userEmail, name } = req.body;
        
        let itinerary = await Itinerary.findOne({ userEmail });

        if (!itinerary) {
            itinerary = new Itinerary({ userEmail, places: [] });
        }

        itinerary.places.push({ name });
        await itinerary.save();
        res.json({ success: true, message: "Itinerary added successfully", itinerary });
    } catch (error) {
        console.error("Error adding itinerary:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Fetch Itinerary
router.get("/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const itinerary = await Itinerary.findOne({ userEmail: email });

        if (!itinerary) {
            return res.json({ success: false, message: "No itinerary found" });
        }

        res.json({ success: true, itinerary });
    } catch (error) {
        console.error("Error fetching itinerary:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
