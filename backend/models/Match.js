const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    trip1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null
    },

    trip2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null
    },

    compatibilityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending"
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user2: 1, user1: 1 });
matchSchema.index({ user1: 1, status: 1 });
matchSchema.index({ user2: 1, status: 1 });

module.exports = mongoose.model("Match", matchSchema);
