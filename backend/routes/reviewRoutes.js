const express = require("express");
const Review = require("../models/Review");
const Match = require("../models/Match");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================= CREATE REVIEW =================
router.post("/", protect, async (req, res) => {
  try {
    const { revieweeId, tripId, rating, comment } = req.body;

    if (!revieweeId || !tripId || !rating) {
      return res.status(400).json({ message: "Reviewee, trip, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (revieweeId === req.user.id) {
      return res.status(400).json({ message: "Cannot review yourself" });
    }

    // Verify they actually traveled together
    const match = await Match.findOne({
      $or: [
        { user1: req.user.id, user2: revieweeId, status: "accepted" },
        { user1: revieweeId, user2: req.user.id, status: "accepted" }
      ],
      $or: [
        { trip1: tripId },
        { trip2: tripId }
      ]
    });

    if (!match) {
      return res.status(400).json({ message: "You can only review people you've traveled with" });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewee: revieweeId,
      trip: tripId
    });

    if (existingReview) {
      return res.status(400).json({ message: "You've already reviewed this person for this trip" });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: revieweeId,
      trip: tripId,
      rating,
      comment: comment || ""
    });

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name avatar")
      .populate("reviewee", "name avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET USER REVIEWS =================
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar")
      .populate("trip", "destination startDate endDate")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.status(200).json({
      reviews,
      averageRating: parseFloat(avgRating),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE REVIEW =================
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
