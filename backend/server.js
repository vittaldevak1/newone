const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);

const Match = require("./models/Match");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ");
    // One-time cleanup of duplicate matches
    const allMatches = await Match.find().sort({ createdAt: -1 });
    const seen = new Set();
    const toDelete = [];
    for (const m of allMatches) {
      const key = [m.user1.toString(), m.user2.toString()].sort().join('-');
      if (seen.has(key)) toDelete.push(m._id);
      else seen.add(key);
    }
    if (toDelete.length > 0) {
      await Match.deleteMany({ _id: { $in: toDelete } });
      console.log(`Cleaned ${toDelete.length} duplicate matches`);
    }
  })
  .catch((err) => console.log(err));

// Test API route
app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello from Express backend "
  });
});

// Home route
app.get("/", (req, res) => {
  res.send("Server running ");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});