const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    destination: {
      type: String,
      required: true,
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    activities: [{
      type: String,
      trim: true
    }],

    description: {
      type: String,
      maxlength: 1000,
      default: ""
    },

    lookingFor: {
      type: String,
      enum: ["travel-buddies", "local-guide", "any"],
      default: "travel-buddies"
    },

    budget: {
      type: String,
      enum: ["budget", "mid-range", "luxury", "flexible", ""],
      default: ""
    },

    maxCompanions: {
      type: Number,
      min: 1,
      max: 20,
      default: 4
    },

    tripType: {
      type: String,
      enum: ["immediate", "planned"],
      default: "planned"
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    },

    itinerary: [{
      day: { type: Number, required: true },
      title: { type: String, trim: true },
      activities: [{ type: String, trim: true }],
      notes: { type: String, default: "" },
    }],
  },
  {
    timestamps: true
  }
);

tripSchema.index({ destination: 1, startDate: 1, endDate: 1 });
tripSchema.index({ user: 1 });

module.exports = mongoose.model("Trip", tripSchema);
