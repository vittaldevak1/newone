# WireUs MVP - Complete Setup & Launch Guide

## ✅ What's Been Built

### Backend (Express + MongoDB)
- ✅ User authentication (signup/login with JWT)
- ✅ Trip creation & management
- ✅ Matching algorithm (compatibility scoring)
- ✅ User profiles
- ✅ Circles (activity groups)
- ✅ Messaging
- ✅ Reviews & ratings

### Frontend (React + Vite)
- ✅ Login page
- ✅ Signup page
- ✅ Trip creation form
- ✅ Matches display
- ✅ Match card with compatibility score
- ✅ API integration

### Database (MongoDB)
- ✅ User schema
- ✅ Trip schema
- ✅ Match schema
- ✅ Circle schema
- ✅ Message schema
- ✅ Review schema

---

## 🚀 Launch Steps (Do This Now)

### Step 1: MongoDB Setup (2 minutes)
1. Go to https://mongodb.com/cloud/atlas
2. Create free account (or login)
3. Create a new **cluster** (choose free tier)
4. Create a **database user** (save username & password)
5. Get connection string: 
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string
   - It looks like: `mongodb+srv://user:pass@cluster.mongodb.net/wireus?retryWrites=true&w=majority`

### Step 2: Update Server Configuration (1 minute)
Update `/wireus/server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/wireus
JWT_SECRET=your_super_secret_key_change_this
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Replace:
- `YOUR_USERNAME` with your MongoDB user
- `YOUR_PASSWORD` with your MongoDB password
- `YOUR_CLUSTER` with your cluster name

### Step 3: Start the Backend (5 minutes)
```bash
cd /wireus/server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

**Keep this terminal open!**

### Step 4: Start the Frontend (new terminal, 3 minutes)
```bash
cd /wireus/client
npm run dev
```

You should see:
```
VITE v... ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 5: Test the App (5 minutes)
1. Open http://localhost:5173 in browser
2. Click "Sign up"
3. Create account with:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
4. Click "Sign Up"
5. You're now logged in!
6. Click "Find Travel Buddies"
7. Fill in trip details:
   - Destination: "Bali" (for testing)
   - Start Date: Pick a date in future
   - End Date: Pick a date after start
   - Activities: Select 2-3
   - Click "Find Travel Buddies"

**If you see matches, congratulations! 🎉**
(You won't have real matches yet, but the system is working!)

---

## 📝 What to Build Next (Priority Order)

### Week 1 (This Week)
1. **Profile Setup Component** (15 mins)
   - After signup, redirect to profile setup
   - Collect: age range, interests, languages, travel style, bio
   - Save to backend
   
2. **Dashboard Component** (30 mins)
   - Show user trips
   - Show connections/matches
   - Quick actions (create trip, view messages)

3. **Seed Test Data** (10 mins)
   - Create 3-5 test users with trips to same destination
   - Verify matching works

### Week 2
4. **Direct Messaging UI** (1 hour)
   - Message list for each match
   - Send/receive messages
   - Mark as read

5. **User Profile View** (30 mins)
   - Click on match to see full profile
   - View their reviews
   - See their other trips

### Week 3
6. **Deployment**
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel
   - Point to production MongoDB

---

## 🐛 Testing Checklist

### Authentication
- [ ] Signup works (new account created in DB)
- [ ] Login works (JWT token generated)
- [ ] Protected routes redirect to login
- [ ] Token persists in localStorage

### Trips
- [ ] Can create a trip
- [ ] Trip saved to database
- [ ] Trip shows destination & dates

### Matching
- [ ] Matches appear for overlapping trips to same destination
- [ ] Compatibility score is calculated (0-100)
- [ ] Matches are sorted by compatibility

### Messages
- [ ] Can send message (open browser console, check API)
- [ ] Message saved to database

---

## 🔧 Common Issues & Fixes

### "Cannot connect to MongoDB"
**Problem**: `MongoDB error: connect ECONNREFUSED`
**Fix**: 
- Check your MONGODB_URI in `.env`
- Make sure username/password is correct
- Whitelist your IP on MongoDB Atlas (Network > IP Whitelist > Add IP)

### "Port 5000 already in use"
**Problem**: Server won't start
**Fix**:
```bash
# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# Windows: use Task Manager to kill node.exe
```

### "CORS error in browser console"
**Problem**: Frontend can't talk to backend
**Fix**:
- Check CORS_ORIGIN in `.env` is `http://localhost:5173`
- Restart server after changing `.env`

### "No matches found"
**Problem**: Created trip but no matches
**Fix**:
- Other trips must have:
  - SAME destination (exact match)
  - OVERLAPPING dates
  - Different user ID

---

## 📊 Database Check

### To verify data in MongoDB:
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Check collections:
   - `users` - should have your signup
   - `trips` - should have your created trip
   - `matches` - should have generated matches

---

## 🎯 Success Criteria

You're done with MVP when:
- ✅ Signup/login works
- ✅ Can create trips
- ✅ Matches appear for overlapping trips
- ✅ Can connect with matches
- ✅ Can send messages (backend works)
- ✅ Can see user reviews (backend works)

---

## 📱 Next: Mobile Responsiveness

Update CSS to be mobile-friendly:
```css
@media (max-width: 768px) {
  .match-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
```

---

## 🚢 Deployment Checklist

When ready to launch publicly:

### Backend (Railway or Render)
1. Push code to GitHub
2. Connect GitHub to Railway/Render
3. Set environment variables on platform
4. Deploy
5. Get production URL (e.g., wireus-api.railway.app)

### Frontend (Vercel)
1. Push code to GitHub
2. Import repo to Vercel
3. Update `VITE_API_BASE_URL` to production backend URL
4. Deploy
5. Get production URL (e.g., wireus.vercel.app)

### MongoDB
- Already production-ready (Atlas is cloud)
- Just update password if sharing code

---

## 💡 Quick Wins for Next Phase

1. **Referral System** (30 mins)
   - Add referral code generation
   - Track referrals in User model

2. **Destination Hubs** (1 hour)
   - Create `/destinations/:destination` route
   - Show all travelers going to destination
   - Show trending dates

3. **Activity Circles** (1 hour)
   - Pre-create 5-6 circles (photography, food, hiking, etc.)
   - Allow users to join/leave
   - Show circle members

---

## 🎓 Learning Resources

- React: https://react.dev
- Express: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- JWT: https://jwt.io
- Vite: https://vitejs.dev

---

**You have a fully functional MVP!**

Next step: Create that profile setup component and test with real data.

Good luck! 🚀
