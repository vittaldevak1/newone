const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const router = express.Router();


// ================= REGISTER =================

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check if all fields are filled
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter"
            });
        }

        if (!/[a-z]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one lowercase letter"
            });
        }

        if (!/\d/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one number"
            });
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one special character"
            });
        }

        // Check if email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send response
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileComplete: user.profileComplete
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ================= LOGIN =================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check if all fields are filled
        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }


        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileComplete: user.profileComplete
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
router.get("/profile", protect, async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// ================= UPDATE PROFILE =================

router.put("/profile", protect, async (req, res) => {

    try {

        const { age, bio, nationality, languages, travelStyle, interests, avatar, social, visitedPlaces, wishlist, privacy, name, email, currentPassword, newPassword } = req.body;

        const updateFields = {};

        if (age !== undefined) updateFields.age = age;
        if (bio !== undefined) updateFields.bio = bio;
        if (nationality !== undefined) updateFields.nationality = nationality;
        if (languages !== undefined) updateFields.languages = languages;
        if (travelStyle !== undefined) updateFields.travelStyle = travelStyle;
        if (interests !== undefined) updateFields.interests = interests;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (social !== undefined) updateFields.social = social;
        if (visitedPlaces !== undefined) updateFields.visitedPlaces = visitedPlaces;
        if (wishlist !== undefined) updateFields.wishlist = wishlist;
        if (privacy !== undefined) updateFields.privacy = privacy;
        if (name !== undefined) updateFields.name = name;

        // Handle email change
        if (email !== undefined) {
            const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ message: "Email already in use" });
            }
            updateFields.email = email;
        }

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }
            const user = await User.findById(req.user.id);
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }
            updateFields.password = await bcrypt.hash(newPassword, 10);
        }

        // Mark profile as complete if key fields are filled
        if (age && travelStyle && interests && interests.length > 0) {
            updateFields.profileComplete = true;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// ================= DELETE PROFILE =================
router.delete("/profile", protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= VERIFY PHONE =================
router.post("/verify-phone", protect, async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }
        // Check if phone is already used by another user
        const existingUser = await User.findOne({ phone, _id: { $ne: req.user.id } });
        if (existingUser) {
            return res.status(400).json({ message: "This phone number is already registered with another account" });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { phone, phoneVerified: true },
            { new: true }
        ).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= BLOCK / UNBLOCK USER =================
router.post("/block", protect, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || userId === req.user.id) {
            return res.status(400).json({ message: "Invalid user" });
        }
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: userId } });
        res.status(200).json({ message: "User blocked" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/unblock", protect, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "Invalid user" });
        }
        await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: userId } });
        res.status(200).json({ message: "User unblocked" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/blocked", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("blockedUsers", "name avatar");
        res.status(200).json(user.blockedUsers || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= GOOGLE OAUTH =================
router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Google token is required"
            });
        }

        const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if (!googleResponse.ok) {
            return res.status(400).json({
                message: "Invalid Google token"
            });
        }

        const profile = await googleResponse.json();
        const { email, name } = profile;

        if (!email) {
            return res.status(400).json({
                message: "Email not provided by Google account"
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name: name || email.split("@")[0],
                email,
                password: hashedPassword
            });
        }

        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Google login successful",
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileComplete: user.profileComplete
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;