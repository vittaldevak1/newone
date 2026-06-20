import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../services/api";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Connect/disconnect based on auth token
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineUsers(new Set());
      }
      return;
    }

    const newSocket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    // Online status events
    newSocket.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers(new Set());
    };
  }, [token]);

  const isUserOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, isUserOnline }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
