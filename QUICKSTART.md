# Remindly - Quick Start Guide

Get the complete Remindly application up and running in 5 minutes!

## Prerequisites

Before you start, make sure you have:
- **Node.js** installed (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** running locally - [Install MongoDB](https://docs.mongodb.com/manual/installation/)
  - Alternative: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

## Step-by-Step Setup

### 1. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
# Windows: MongoDB should be running as a service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string (looks like: mongodb+srv://user:password@cluster.mongodb.net/remindly)

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - MONGODB_URI: connection string
# - JWT_SECRET: any secure random string
# - GEMINI_API_KEY: your Google Gemini API key
# - CORS_ORIGIN: http://localhost:5173 (frontend URL)
```

**Edit .env file:**
```env
MONGODB_URI=mongodb://localhost:27017/remindly
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-key-12345
GEMINI_API_KEY=AIzaSyD...your-key-here...
```

**Start backend:**
```bash
npm start
```

You should see:
```
✓ Backend server running on port 5000
✓ Environment: development
✓ Connected to MongoDB
```

### 3. Frontend Setup (Terminal 2)

```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

## Testing the Application

### Test Flow

1. **Sign Up**
   - Click "Sign Up"
   - Enter name, email, and password
   - You're automatically logged in and redirected to Dashboard

2. **Create a Topic**
   - Click "+ Add Topic"
   - Enter title: "React Hooks"
   - Write explanation (50-100 words): "React Hooks are functions that let you use React features without writing a class. Common hooks include useState for state management, useEffect for side effects, and useContext for accessing context. They enable functional components to have state and lifecycle methods. Hooks must be called at the top level of your component function..."
   - Select category: "Programming"
   - Click "Create Topic"

3. **Revise Topic**
   - Click on the topic card
   - Write your understanding
   - Click "Evaluate"
   - AI will score your explanation
   - If score ≥ 6/10, quiz unlocks
   - Answer the AI-generated quiz
   - Submit to earn points

4. **Check Leaderboard**
   - Click "Leaderboard" from navigation
   - See your rank and points

## Available Commands

### Backend
```bash
npm start          # Production start
npm run dev        # Development with auto-reload (requires nodemon)
```

### Frontend
```bash
npm run dev        # Development server with hot reload
npm run build      # Create production build
npm run preview    # Preview production build locally
```

## API Health Check

Test if backend is working:
```bash
curl http://localhost:5000/health
# Response: {"status":"Server is running"}
```

## Troubleshooting

### "Cannot connect to MongoDB"
- ✓ Check MongoDB is running
- ✓ Verify MONGODB_URI in .env
- ✓ If using Atlas, whitelist your IP address
- ✓ Check connection string format

### "Frontend shows blank page"
- ✓ Check browser console for errors (F12)
- ✓ Make sure backend is running on port 5000
- ✓ Clear browser cache and refresh

### "GEMINI_API_KEY is required"
- ✓ Get API key from https://makersuite.google.com/app/apikey
- ✓ Add to .env file
- ✓ Restart backend server

### "CORS error in browser"
- ✓ Make sure CORS_ORIGIN in backend .env is http://localhost:5173
- ✓ Restart backend
- ✓ Clear browser cache

### "Port 5000 or 5173 already in use"
- ✓ Change PORT in backend .env
- ✓ Frontend port is configured in vite.config.js
- ✓ Or kill process using that port

## Project Structure

```
remindly-app/
├── backend/              ← Node.js/Express server
│   ├── server.js        ← Main entry point
│   ├── .env             ← Configuration (create from .env.example)
│   ├── package.json
│   ├── models/          ← MongoDB schemas
│   ├── controllers/     ← Business logic
│   ├── routes/          ← API endpoints
│   ├── middleware/      ← Authentication, error handling
│   ├── utils/           ← Helper functions
│   └── config/          ← Database connection
│
├── frontend/            ← React/Vite application
│   ├── src/
│   │   ├── main.jsx     ← React entry point
│   │   ├── App.jsx      ← Router setup
│   │   ├── pages/       ← Page components
│   │   ├── components/  ← Reusable components
│   │   ├── context/     ← Auth state management
│   │   ├── services/    ← API calls
│   │   └── styles/      ← CSS stylesheets
│   ├── index.html
│   ├── vite.config.js   ← Build configuration
│   └── package.json
│
└── README.md            ← Full documentation
```

## Key Endpoints

**Auth**
- POST `/api/auth/signup` - Create account
- POST `/api/auth/signin` - Login
- GET `/api/auth/me` - Get current user

**Topics**
- GET `/api/topics` - List all topics
- POST `/api/topics` - Create topic
- GET `/api/topics/:id` - Get topic details
- POST `/api/topics/:id/mark-revised` - Mark revised

**AI**
- POST `/api/ai/generate-quiz` - Generate questions
- POST `/api/ai/evaluate-explanation` - AI scores your answer

**Leaderboard**
- GET `/api/leaderboard` - Get top 50 users

## Features to Try

✅ **Sign Up & Login** - Create account and test authentication
✅ **Add Multiple Topics** - Try different categories
✅ **Revision System** - Topics scheduled for Day 1, 7, 30
✅ **AI Evaluation** - Write explanations and get AI feedback
✅ **Adaptive Quizzes** - Questions adjust to difficulty
✅ **Points & Streaks** - Earn points and build streaks
✅ **Leaderboard** - See your rank

## Next Steps

After getting it running:

1. **Explore the Code**
   - Check backend controllers for business logic
   - Review frontend components for UI structure
   - Look at API service for all available calls

2. **Customize**
   - Change colors in CSS files
   - Modify point multipliers in controllers
   - Adjust revision schedule in utils

3. **Deploy** (See README.md for deployment options)
   - Deploy backend to Heroku, Railway, or similar
   - Deploy frontend to Vercel, Netlify, or similar

## Support

Having issues? Check:
- Full README.md for detailed documentation
- Backend server console for errors
- Browser console (F12) for frontend errors
- MongoDB connection string format

## Performance Tips

- **Development**: Keep both terminals open for live reload
- **Database**: Use local MongoDB for faster development
- **API Keys**: Keep GEMINI_API_KEY secret, never commit .env
- **Browser**: Use Chrome DevTools for debugging

Enjoy using Remindly! 🚀
