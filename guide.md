# WireUs - Travel Companion Matching Platform

## Quick Start Guide

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (free tier works)
- Git

### Step 1: Clone/Setup
```bash
cd wireus
```

### Step 2: Configure MongoDB
1. Go to MongoDB Atlas (mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wireus
   JWT_SECRET=your-secret-key
   ```

### Step 3: Start the Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Start the Client (in new terminal)
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### Step 5: Create Your First Trip
1. Go to http://localhost:5173
2. Sign up
3. Create a trip
4. Get matched with travelers!

## Project Structure

```
wireus/
├── server/              # Express backend
│   ├── src/
│   │   ├── server.js
│   │   ├── models/     # MongoDB schemas
│   │   ├── routes/     # API endpoints
│   │   ├── controllers/# Business logic
│   │   └── middleware/ # Auth, validation
│   ├── package.json
│   └── .env
│
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # API calls
│   │   ├── context/    # Auth context
│   │   ├── hooks/      # Custom hooks
│   │   ├── styles/     # CSS files
│   │   └── App.jsx
│   ├── package.json
│   └── .env
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/login` - Log in
- `GET /api/auth/me` - Get current user

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips/user/trips` - Get user's trips
- `GET /api/trips/:tripId` - Get single trip

### Matching
- `GET /api/matches/trip/:tripId` - Get matches for a trip
- `PUT /api/matches/:matchId` - Update match status
- `GET /api/matches/connections/my` - Get connections

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:matchId` - Get messages for a match

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get user reviews

## Next Steps

1. **Add Profile Setup**: Create ProfileSetup component for interests, age, travel style
2. **Add Dashboard**: Show user trips, connections, messages
3. **Add Chat UI**: Real-time messaging with Socket.io
4. **Deploy**: Deploy to Vercel (frontend) and Heroku/Railway (backend)

## Tech Stack

- **Frontend**: React 18, Vite, Axios, React Router
- **Backend**: Node.js, Express, MongoDB, JWT, Bcrypt
- **Styling**: CSS3

## Notes

- Compatibility scoring is 0-100 based on interests, travel style, activities, age, languages
- Matches only appear between trips to the same destination with overlapping dates
- All endpoints (except auth/public) require JWT token in header

Good luck! 🚀
