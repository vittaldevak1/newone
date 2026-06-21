const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    avatar: {
        type: String,
        default: ""
    },

    age: {
        type: Number,
        min: 18,
        max: 100
    },

    bio: {
        type: String,
        maxlength: 500,
        default: ""
    },

    nationality: {
        type: String,
        default: ""
    },

    languages: [{
        type: String
    }],

    travelStyle: {
        type: String,
        enum: ["budget", "mid-range", "luxury", "backpacker", "family-friendly", ""],
        default: ""
    },

    budget: {
        type: String,
        enum: ["budget", "mid-range", "luxury", "flexible", ""],
        default: ""
    },

    travelPace: {
        type: String,
        enum: ["relaxed", "balanced", "fast-paced", ""],
        default: ""
    },

    interests: [{
        type: String
    }],

    prompts: {
        idealTrip: { type: String, maxlength: 250, default: "" },
        travelHabits: { type: String, maxlength: 250, default: "" },
        lookingFor: { type: String, maxlength: 250, default: "" },
    },

    social: {
        instagram: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        twitter: { type: String, default: "" },
        facebook: { type: String, default: "" },
        tiktok: { type: String, default: "" },
        youtube: { type: String, default: "" },
        phone: { type: String, default: "" },
    },

    profileComplete: {
        type: Boolean,
        default: false
    },

    visitedPlaces: [{
        type: String
    }],

    wishlist: [{
        type: String
    }],

    privacy: {
        showAge: { type: Boolean, default: true },
        showNationality: { type: Boolean, default: true },
        allowMessages: { type: Boolean, default: true },
    },

    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    phone: {
        type: String,
        default: "",
    },

    phoneVerified: {
        type: Boolean,
        default: false
    },

    typing: {
        matchId: { type: mongoose.Schema.Types.ObjectId, default: null },
        lastTyped: { type: Date, default: null }
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);