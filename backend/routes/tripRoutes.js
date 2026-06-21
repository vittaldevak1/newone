const express = require("express");
const Trip = require("../models/Trip");
const Match = require("../models/Match");
const User = require("../models/User");
const { getCompatibilityScore } = require("../utils/matching");
const protect = require("../middleware/authMiddleware");
const requirePhoto = require("../middleware/requirePhoto");

const router = express.Router();

// ================= CREATE TRIP =================
router.post("/", protect, requirePhoto, async (req, res) => {
  try {
    const { destination, startDate, endDate, activities, description, lookingFor, maxCompanions, tripType, budget } = req.body;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    if (tripType === "immediate") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const trip = await Trip.create({
        user: req.user.id,
        destination: destination.trim(),
        startDate: today,
        endDate: today,
        activities: activities || [],
        description: description || "",
        lookingFor: lookingFor || "travel-buddies",
        maxCompanions: maxCompanions || 4,
        tripType: "immediate",
        budget: budget || ""
      });

      const matchingTrips = await Trip.find({
        user: { $ne: req.user.id },
        destination: { $regex: new RegExp(`^${destination.trim()}$`, "i") },
        status: "active",
        startDate: { $lte: today },
        endDate: { $gte: today }
      }).populate("user", "-password");

      const currentUser = await User.findById(req.user.id);
      const matches = [];

      for (const otherTrip of matchingTrips) {
        const existingMatch = await Match.findOne({
          $or: [
            { user1: req.user.id, user2: otherTrip.user._id, trip1: trip._id, trip2: otherTrip._id },
            { user1: otherTrip.user._id, user2: req.user.id, trip1: otherTrip._id, trip2: trip._id }
          ]
        });

        if (!existingMatch) {
          const { compatibility } = getCompatibilityScore(currentUser, otherTrip.user, trip, otherTrip);
          const match = await Match.create({
            user1: req.user.id,
            user2: otherTrip.user._id,
            trip1: trip._id,
            trip2: otherTrip._id,
            compatibilityScore: compatibility,
            initiatedBy: req.user.id
          });
          matches.push(match);
        }
      }

      return res.status(201).json({
        message: "Trip created successfully",
        trip,
        newMatches: matches.length
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required for planned trips" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    const trip = await Trip.create({
      user: req.user.id,
      destination: destination.trim(),
      startDate,
      endDate,
      activities: activities || [],
      description: description || "",
      lookingFor: lookingFor || "travel-buddies",
      maxCompanions: maxCompanions || 4,
      tripType: "planned",
      budget: budget || ""
    });

    // Find potential matches
    const matchingTrips = await Trip.find({
      user: { $ne: req.user.id },
      destination: { $regex: new RegExp(`^${destination.trim()}$`, "i") },
      status: "active",
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    }).populate("user", "-password");

    const currentUser = await User.findById(req.user.id);
    const matches = [];

    for (const otherTrip of matchingTrips) {
      const existingMatch = await Match.findOne({
        $or: [
          { user1: req.user.id, user2: otherTrip.user._id, trip1: trip._id, trip2: otherTrip._id },
          { user1: otherTrip.user._id, user2: req.user.id, trip1: otherTrip._id, trip2: trip._id }
        ]
      });

      if (!existingMatch) {
        const { compatibility } = getCompatibilityScore(currentUser, otherTrip.user, trip, otherTrip);
        const match = await Match.create({
          user1: req.user.id,
          user2: otherTrip.user._id,
          trip1: trip._id,
          trip2: otherTrip._id,
          compatibilityScore: compatibility,
          initiatedBy: req.user.id
        });
        matches.push(match);
      }
    }

    res.status(201).json({
      message: "Trip created successfully",
      trip,
      newMatches: matches.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET USER TRIPS =================
router.get("/user/trips", protect, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET SINGLE TRIP =================
router.get("/:tripId", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate("user", "-password");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE TRIP =================
router.put("/:tripId", protect, requirePhoto, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this trip" });
    }

    const { destination, startDate, endDate, activities, description, lookingFor, maxCompanions, status, itinerary, budget } = req.body;

    const updateFields = {};
    if (destination !== undefined) updateFields.destination = destination;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (endDate !== undefined) updateFields.endDate = endDate;
    if (activities !== undefined) updateFields.activities = activities;
    if (description !== undefined) updateFields.description = description;
    if (lookingFor !== undefined) updateFields.lookingFor = lookingFor;
    if (maxCompanions !== undefined) updateFields.maxCompanions = maxCompanions;
    if (status !== undefined) updateFields.status = status;
    if (itinerary !== undefined) updateFields.itinerary = itinerary;
    if (budget !== undefined) updateFields.budget = budget;

    const updated = await Trip.findByIdAndUpdate(
      req.params.tripId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE TRIP =================
router.delete("/:tripId", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this trip" });
    }

    await Trip.findByIdAndDelete(req.params.tripId);
    await Match.deleteMany({ $or: [{ trip1: req.params.tripId }, { trip2: req.params.tripId }] });

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
