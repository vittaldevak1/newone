# Real-Time Updates Implementation Plan

## Overview
Replace polling-based messaging, typing indicators, and notifications with Socket.IO for instant updates. Add online status tracking.

## Current State (Polling)
- Messages: `setInterval(fetchMessages, 3000)` in MessagesPanel
- Typing: `setInterval(checkTyping, 3000)` in MessagesPanel
- Notifications: `setInterval(checkNotifications, 15000)` in Notifications
- Online status: not implemented

## Target State (Socket.IO)
- Messages: instant receive via socket event
- Typing: instant via socket (no DB writes)
- Notifications: instant via socket events
- Online status: tracked via socket connections

---

## Backend Changes

### 1. Install dependency
```
cd backend && npm install socket.io
```

### 2. Create `backend/socket.js`
New file - Socket.IO server setup:
- Initialize `Server` attached to Express HTTP server
- JWT auth middleware (verify token from `auth` header)
- Track online users: `Map<userId, Set<socketId>>` for multi-device support
- Events handled:
  - `connection` - authenticate, add to online users, broadcast online status
  - `disconnect` - remove from online users, broadcast offline status
  - `join-match` - join a room for a specific match (for messaging)
  - `leave-match` - leave match room
  - `message:send` - save to DB, emit `message:receive` to match room
  - `typing:start` - emit `typing:start` to match room (no DB write)
  - `typing:stop` - emit `typing:stop` to match room
- Export: `initSocket(server)`, `getIO()`, `getOnlineUsers()`, `isUserOnline(userId)`

### 3. Modify `backend/server.js`
- Import `http` and create `httpServer`
- Import and call `initSocket(httpServer)`
- Change `app.listen()` to `httpServer.listen()`
- Attach `io` to `app.locals` for route access

### 4. Modify `backend/routes/messageRoutes.js`
- In `POST /` (send message): after saving, emit `message:receive` to match room via `req.app.locals.io`
- Remove `POST /typing` and `GET /typing/:matchId/:userId` (replaced by socket)

### 5. Modify `backend/routes/matchRoutes.js`
- In `POST /connect`: emit `match:new` to target user
- In `PUT /:matchId/accept`: emit `match:accepted` to both users
- In `PUT /:matchId/decline`: emit `match:declined` to both users

---

## Frontend Changes

### 1. Install dependency
```
cd frontend && npm install socket.io-client
```

### 2. Create `frontend/src/context/SocketContext.jsx`
New file - Socket.IO client:
- Connect to `API_URL` with JWT token
- Auto-connect when token exists, disconnect on logout
- Track online users list via `user:online` / `user:offline` events
- Provide: `socket`, `onlineUsers` (Set of userIds), `isUserOnline(userId)`
- Handle reconnection

### 3. Modify `frontend/src/main.jsx`
- Wrap app with `SocketProvider` (inside AuthProvider, outside routes)

### 4. Modify `frontend/src/components/MessagesPanel.jsx`
- Remove message polling (`setInterval(fetchMessages, 3000)`)
- Remove typing polling (`setInterval(checkTyping, 3000)`)
- Keep initial fetch on conversation open
- Listen for `message:receive` → append to messages
- Listen for `typing:start` / `typing:stop` → update `otherTyping`
- Emit `typing:start` / `typing:stop` via socket instead of API call
- Join match room on conversation open, leave on close

### 5. Modify `frontend/src/components/Notifications.jsx`
- Remove polling (`setInterval(checkNotifications, 15000)`)
- Listen for socket events:
  - `match:new` → add notification
  - `match:accepted` → add notification
  - `match:declined` → add notification
  - `message:receive` → increment unread count
- Keep initial fetch on mount

### 6. Add online status indicators
- `MessagesPanel.jsx`: show green dot on conversation avatars for online users
- `MessagesPanel.jsx`: show "Online" / "Offline" in chat header
- Use `onlineUsers` from SocketContext

### 7. Modify `frontend/src/services/api.js`
- Remove `sendTyping` function (now via socket)
- Remove `getTyping` function (now via socket)

---

## Files Modified
| File | Action |
|------|--------|
| `backend/package.json` | add socket.io |
| `backend/socket.js` | **NEW** |
| `backend/server.js` | modify (attach http, init socket) |
| `backend/routes/messageRoutes.js` | modify (emit on send, remove typing routes) |
| `backend/routes/matchRoutes.js` | modify (emit on connect/accept/decline) |
| `frontend/package.json` | add socket.io-client |
| `frontend/src/context/SocketContext.jsx` | **NEW** |
| `frontend/src/main.jsx` | modify (wrap with SocketProvider) |
| `frontend/src/components/MessagesPanel.jsx` | modify (socket events, remove polling) |
| `frontend/src/components/Notifications.jsx` | modify (socket events, remove polling) |
| `frontend/src/services/api.js` | modify (remove typing functions) |

## Socket Events Summary

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `join-match` | client→server | `{ matchId }` | Join match room |
| `leave-match` | client→server | `{ matchId }` | Leave match room |
| `message:send` | client→server | `{ matchId, content }` | Send message |
| `message:receive` | server→client | `{ message, matchId }` | New message |
| `typing:start` | client→server | `{ matchId }` | Typing started |
| `typing:stop` | client→server | `{ matchId }` | Typing stopped |
| `typing:start` | server→client | `{ matchId, userId }` | Other user typing |
| `typing:stop` | server→client | `{ matchId, userId }` | Other user stopped |
| `user:online` | server→client | `{ userId }` | User came online |
| `user:offline` | server→client | `{ userId }` | User went offline |
| `match:new` | server→client | `{ match }` | New connection request |
| `match:accepted` | server→client | `{ match }` | Match accepted |
| `match:declined` | server→client | `{ matchId }` | Match declined |

## Verification
1. Open two browser windows with different accounts
2. Send a message → should appear instantly on both sides
3. Type in chat → other side should see typing indicator instantly
4. Send connect request → notification appears instantly
5. Accept/decline → both users see update instantly
6. Green dot appears on online users in conversation list
7. Close one window → other sees user go offline
