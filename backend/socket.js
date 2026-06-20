const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Map<userId, Set<socketId>> for multi-device support
const onlineUsers = new Map();

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
        : true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit("user:online", { userId });

    // Join user's personal room for targeted events
    socket.join(`user:${userId}`);

    // ================= MATCH ROOM =================
    socket.on("join-match", ({ matchId }) => {
      socket.join(`match:${matchId}`);
      console.log(`[Socket] ${userId} joined match room: ${matchId}`);
    });

    socket.on("leave-match", ({ matchId }) => {
      socket.leave(`match:${matchId}`);
      console.log(`[Socket] ${userId} left match room: ${matchId}`);
    });

    // ================= MESSAGING =================
    socket.on("message:send", async ({ matchId, content }) => {
      try {
        const Match = mongoose.model("Match");
        const Message = mongoose.model("Message");

        const match = await Match.findById(matchId);
        if (!match) return;

        // Verify user is part of this match
        if (
          match.user1.toString() !== userId &&
          match.user2.toString() !== userId
        ) {
          return;
        }

        // Save message
        const message = await Message.create({
          match: matchId,
          sender: userId,
          content,
        });

        const populated = await Message.findById(message._id).populate(
          "sender",
          "name avatar"
        );

        // Emit to match room (for active chat)
        io.to(`match:${matchId}`).emit("message:receive", {
          message: populated,
          matchId,
        });

        // Emit notification to recipient's personal room (for notification bell)
        const recipientId = match.user1.toString() === userId
          ? match.user2.toString()
          : match.user1.toString();
        io.to(`user:${recipientId}`).emit("message:notification", {
          message: populated,
          matchId,
        });
      } catch (err) {
        console.error("[Socket] message:send error:", err.message);
      }
    });

    // ================= TYPING INDICATORS =================
    socket.on("typing:start", ({ matchId }) => {
      socket.to(`match:${matchId}`).emit("typing:start", {
        matchId,
        userId,
      });
    });

    socket.on("typing:stop", ({ matchId }) => {
      socket.to(`match:${matchId}`).emit("typing:stop", {
        matchId,
        userId,
      });
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${userId}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast offline only when all devices disconnected
          io.emit("user:offline", { userId });
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

function getOnlineUsers() {
  return new Set(onlineUsers.keys());
}

function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

module.exports = { initSocket, getIO, getOnlineUsers, isUserOnline };
