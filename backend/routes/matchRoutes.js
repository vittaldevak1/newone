const express = require("express");
const Match = require("../models/Match");
const User = require("../models/User");
const Trip = require("../models/Trip");
const { getCompatibilityScore } = require("../utils/matching");
const protect = require("../middleware/authMiddleware");
const requirePhoto = require("../middleware/requirePhoto");

const router = express.Router();

// ================= CLEANUP OLD DUPLICATES =================
router.delete("/cleanup", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.user.id }, { user2: req.user.id }]
    }).sort({ createdAt: -1 });

    const seen = new Set();
    const toDelete = [];
    for (const m of matches) {
      const u1 = m.user1.toString();
      const u2 = m.user2.toString();
      const key = [u1, u2].sort().join('-');
      if (seen.has(key)) {
        toDelete.push(m._id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      await Match.deleteMany({ _id: { $in: toDelete } });
    }

    res.status(200).json({ deleted: toDelete.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DISCOVER USERS =================
router.get("/discover", protect, async (req, res) => {
  try {
    const { travelStyle, nationality, interest, page = 1, limit = 20 } = req.query;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = { _id: { $ne: req.user.id } };
    if (travelStyle) filter.travelStyle = travelStyle;
    if (nationality) filter.nationality = { $regex: new RegExp(nationality, "i") };
    if (interest) filter.interests = { $in: [interest] };

    // Filter out blocked users
    const blockedIds = currentUser.blockedUsers || [];
    if (blockedIds.length > 0) {
      filter._id = { $ne: req.user.id, $nin: blockedIds };
    }

    // Over-fetch to account for in-memory filtering of interacted users
    const overFetch = parseInt(limit) + 20;
    const users = await User.find(filter)
      .select("-password")
      .limit(overFetch)
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get users I already interacted with (liked/passed/matched)
    const existingMatches = await Match.find({
      $or: [{ user1: req.user.id }, { user2: req.user.id }]
    }).select("user1 user2");

    const interactedIds = new Set();
    existingMatches.forEach(m => {
      interactedIds.add(m.user1.toString());
      interactedIds.add(m.user2.toString());
    });

    const discovered = users
      .filter(u => !interactedIds.has(u._id.toString()))
      .map(u => ({
        ...u.toObject(),
        compatibility: getCompatibilityScore(currentUser, u),
        sharedInterests: currentUser.interests
          ? currentUser.interests.filter(i => u.interests?.includes(i))
          : [],
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    res.status(200).json({
      users: discovered,
      total: discovered.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= CONNECT (send request) =================
router.post("/connect", protect, requirePhoto, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === req.user.id) {
      return res.status(400).json({ message: "Invalid target" });
    }

    // Check existing
    const existing = await Match.findOne({
      $or: [
        { user1: req.user.id, user2: targetUserId },
        { user1: targetUserId, user2: req.user.id }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: "Already connected or requested" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);
    const score = getCompatibilityScore(currentUser, targetUser);

    // Find trips (optional)
    const myTrips = await Trip.find({ user: req.user.id, status: "active" }).sort({ createdAt: -1 }).limit(1);
    const theirTrips = await Trip.find({ user: targetUserId, status: "active" }).sort({ createdAt: -1 }).limit(1);

    const match = await Match.create({
      user1: req.user.id,
      user2: targetUserId,
      trip1: myTrips.length > 0 ? myTrips[0]._id : null,
      trip2: theirTrips.length > 0 ? theirTrips[0]._id : null,
      compatibilityScore: score,
      initiatedBy: req.user.id,
      status: "pending"
    });

    const populated = await Match.findById(match._id)
      .populate("user1", "-password")
      .populate("user2", "-password")
      .populate("trip1")
      .populate("trip2");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ACCEPT =================
router.put("/:matchId/accept", protect, requirePhoto, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Not found" });
    if (match.user2.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    match.status = "accepted";
    await match.save();

    const populated = await Match.findById(match._id)
      .populate("user1", "-password")
      .populate("user2", "-password")
      .populate("trip1")
      .populate("trip2");

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DECLINE / CANCEL =================
router.put("/:matchId/decline", protect, requirePhoto, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Not found" });

    // Either party can decline/cancel
    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Match.findByIdAndDelete(match._id);
    res.status(200).json({ message: "Removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET MY MATCHES =================
router.get("/my", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.user.id }, { user2: req.user.id }]
    })
      .populate("user1", "-password")
      .populate("user2", "-password")
      .populate("trip1")
      .populate("trip2")
      .sort({ createdAt: -1 });

    const deduped = matches.filter(m => m.user1 && m.user2);

    res.status(200).json(deduped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET CONNECTIONS =================
router.get("/connections", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.user.id }, { user2: req.user.id }],
      status: "accepted"
    })
      .populate("user1", "-password")
      .populate("user2", "-password")
      .populate("trip1")
      .populate("trip2")
      .sort({ updatedAt: -1 });

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
