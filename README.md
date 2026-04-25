# Remindly - Full Stack Application

A complete spaced repetition learning platform with adaptive quizzes, AI-powered evaluations, gamification, and a competitive leaderboard.

## Features

✅ **Authentication** - JWT-based sign up, sign in, and secure session management
✅ **Spaced Repetition** - Automatic revision scheduling (Day 1, 7, 30)
✅ **AI Integration** - Gemini API for intelligent quiz generation and explanation evaluation
✅ **Adaptive Learning** - Difficulty adjusts based on user performance
✅ **Gamification** - Points system, streaks, leaderboard rankings
✅ **Quiz System** - Multiple-choice questions with instant feedback
✅ **User Dashboard** - Track overdue/pending/upcoming topics at a glance
✅ **Leaderboard** - Real-time rankings of top performers
✅ **Responsive Design** - Mobile, tablet, and desktop support

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcrypt for secure hashing
- **AI**: Google Gemini API for intelligent features
- **Port**: 5000

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router v6
- **Build Tool**: Vite
- **HTTP Client**: Fetch API
- **State Management**: Context API
- **Styling**: CSS
- **Port**: 5173

## Project Structure

```
remindly-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Topic.js
│   │   └── QuizResult.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── topicController.js
│   │   ├── aiController.js
│   │   ├── quizController.js
│   │   └── leaderboardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── topicRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── quizRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── revisionLogic.js
│   │   └── geminiAPI.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Header.jsx
    │   ├── pages/
    │   │   ├── SignUp.jsx
    │   │   ├── SignIn.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AddTopic.jsx
    │   │   ├── TopicDetail.jsx
    │   │   └── Leaderboard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── index.css
    │   │   ├── Header.css
    │   │   ├── Auth.css
    │   │   ├── Dashboard.css
    │   │   ├── AddTopic.css
    │   │   ├── TopicDetail.css
    │   │   └── Leaderboard.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file** (copy from .env.example)
   ```bash
   cp .env.example .env
   ```

4. **Configure .env file**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/remindly
   JWT_SECRET=your-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

5. **Ensure MongoDB is running**
   - Local: `mongod`
   - Or use MongoDB Atlas connection string

6. **Start backend**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

Backend will be running at `http://localhost:5000`

### Frontend Setup

1. **Open new terminal and navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will be running at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user

### Topics
- `GET /api/topics` - Get all topics for user
- `POST /api/topics` - Create new topic
- `GET /api/topics/:id` - Get single topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic
- `POST /api/topics/:id/mark-revised` - Mark topic as revised

### AI Features
- `POST /api/ai/generate-quiz` - Generate quiz questions
- `POST /api/ai/evaluate-explanation` - Score user's understanding
- `POST /api/ai/generate-adaptive-quiz` - Generate difficulty-adjusted quiz

### Quiz Results
- `POST /api/quiz-results` - Submit quiz attempt
- `GET /api/quiz-results/:topicId` - Get results for topic

### Leaderboard
- `GET /api/leaderboard` - Get top 50 users

## User Flow

1. **Sign Up** → Create account with email/password
2. **Dashboard** → View today's, overdue, and upcoming topics
3. **Add Topic** → Create new topic with 50-100 word explanation
4. **Topic Detail** → Write explanation, get AI feedback, unlock quiz
5. **Quiz** → Answer adaptive questions, earn points
6. **Leaderboard** → Compete with other users
7. **Spaced Repetition** → System automatically schedules revisions

## Spaced Repetition Schedule

- Day 0: Initial topic creation
- Day 1: First revision (pending)
- Day 7: Second revision
- Day 30: Third revision
- Custom adjustments based on quiz performance

## Points System

Base points: 10
- Easy difficulty: 1x multiplier
- Medium difficulty: 1.5x multiplier
- Hard difficulty: 2x multiplier
- Score percentage applied: `basePoints × (score/totalQuestions) × difficultyMultiplier`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/remindly
JWT_SECRET=your-super-secret-key-change-this
GEMINI_API_KEY=your-google-gemini-api-key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Scripts

### Backend
```bash
npm start          # Production start
npm run dev        # Development with nodemon
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## Performance Notes

- JWT tokens expire after 30 days
- Memory strength decreases 5% per day without revision
- Adaptive multiplier adjusts quiz difficulty
- Streak resets after missing a revision day

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- Protected routes require valid token
- CORS configured for frontend origin only
- User data isolated by userId in database

## Troubleshooting

### Backend won't connect to MongoDB
- Ensure MongoDB service is running
- Check MONGODB_URI in .env
- Verify credentials if using Atlas

### Frontend API calls failing
- Check backend is running on port 5000
- Verify CORS_ORIGIN in .env
- Check browser console for detailed errors

### Gemini API errors
- Verify API key is valid
- Check API quota hasn't been exceeded
- Ensure question parsing is working

## Future Enhancements

- [ ] Social features (share topics, study groups)
- [ ] Dark mode
- [ ] Topic tags and filtering
- [ ] Study session timing
- [ ] Mobile app (React Native)
- [ ] Export/import topics
- [ ] Advanced analytics dashboard
- [ ] Email reminders

## License

MIT
#   H V A _ R e m i n d l y  
 