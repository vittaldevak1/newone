const User = require("../models/User");

const requirePhone = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("phoneVerified");
    if (!user || !user.phoneVerified) {
      return res.status(403).json({
        message: "Phone verification required. Please verify your phone number."
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = requirePhone;
