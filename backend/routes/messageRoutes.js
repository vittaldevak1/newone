const express = require("express");
const Message = require("../models/Message");
const Match = require("../models/Match");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================= SEND MESSAGE =================
router.post("/", protect, async (req, res) => {
  try {
    const { matchId, content } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({ message: "Match ID and content are required" });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to message in this match" });
    }

    if (match.status !== "accepted") {
      return res.status(400).json({ message: "Can only message in accepted matches" });
    }

    const message = await Message.create({
      match: matchId,
      sender: req.user.id,
      content
    });

    const populated = await Message.findById(message._id).populate("sender", "name avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= SELF-CHAT (must be before /:matchId) =================
router.get("/self/messages", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({ match: userId, sender: userId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/self/send", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const userId = req.user.id;
    const message = await Message.create({
      match: userId,
      sender: userId,
      content
    });
    const populated = await Message.findById(message._id).populate("sender", "name avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET UNREAD MESSAGE COUNT (before /:matchId) =================
router.get("/unread/count", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.user.id },
        { user2: req.user.id }
      ]
    }).select("_id");

    const matchIds = matches.map(m => m._id);

    const unreadCount = await Message.countDocuments({
      match: { $in: matchIds },
      sender: { $ne: req.user.id },
      read: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= TYPING INDICATOR =================
router.post("/typing", protect, async (req, res) => {
  try {
    const { matchId } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      typing: { matchId, lastTyped: new Date() }
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/typing/:matchId/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("typing");
    const isTyping = user.typing?.matchId?.toString() === req.params.matchId
      && (Date.now() - new Date(user.typing.lastTyped).getTime()) < 5000;
    res.status(200).json({ isTyping });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET MESSAGES FOR A MATCH =================
router.get("/:matchId", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1.toString() !== req.user.id && match.user2.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ match: req.params.matchId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      {
        match: req.params.matchId,
        sender: { $ne: req.user.id },
        read: false
      },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
