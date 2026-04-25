import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from "./src/routes/authRoutes.js";
import topicRoutes from "./src/routes/topicRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import revisionRoutes from "./src/routes/revisionRoutes.js";
import adaptiveQuizRoutes from "./src/routes/adaptiveQuizRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import quizResultsRoutes from "./src/routes/quizResultsRoutes.js";
import leaderboardRoutes from "./src/routes/leaderboardRoutes.js";

// Initialize dotenv



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Don't forget to actually use the cors middleware!
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/adaptive-quiz", adaptiveQuizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quiz-results", quizResultsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});