const User = require("../models/User");

// Middleware: require a profile photo before performing actions
const requirePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("avatar");
    if (!user || !user.avatar || user.avatar.trim() === "") {
      return res.status(403).json({
        message: "Profile photo is required. Please upload a photo to continue."
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = requirePhoto;
