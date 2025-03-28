const express = require("express");
const router = express.Router();
const Place = require("../models/Place"); 

// Search Route
router.get("/", async (req, res) => {
    try {
        const searchQuery = req.query.search;
        if (!searchQuery) {
            return res.json({ success: false, message: "Search query is required!" });
        }

        // Case-insensitive search
        const places = await Place.find({
            name: { $regex: new RegExp(searchQuery, "i") }  // "i" for case-insensitive
        });

        res.json({ success: true, places });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching places", error });
    }
});

module.exports = router;
