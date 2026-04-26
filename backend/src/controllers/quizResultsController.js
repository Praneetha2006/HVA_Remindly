import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import { createSmartRevisionSchedule } from "../services/smartRevisionService.js";

export const submitQuizResult = async (req, res) => {
  try {
    const { topicId, score, totalQuestions, difficulty } = req.body;

    if (!topicId || score === undefined || !totalQuestions) {
      return res.status(400).json({
        message: "TopicId, score, and totalQuestions are required"
      });
    }

    const quizResult = await QuizAttempt.create({
      userId: req.user._id,
      topicId,
      quizId: topicId,
      isCorrect: score >= (totalQuestions / 2),
      difficulty: difficulty || "medium"
    });

    // Calculate points and percentage score
    const points = Math.round((score / totalQuestions) * 100);
    const scorePercentage = (score / totalQuestions) * 100;

    // Get user to calculate new average
    const user = await User.findById(req.user._id);
    const totalQuizzesSoFar = user.totalQuizzes || 0;
    const currentAverage = user.averageScore || 0;
    
    // Calculate new average score
    const newAverage = ((currentAverage * totalQuizzesSoFar) + scorePercentage) / (totalQuizzesSoFar + 1);

    // Update user with new stats
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $inc: { points, totalQuizzes: 1 },
        $set: { averageScore: Math.round(newAverage * 100) / 100 }
      },
      { new: true }
    );

    // Create smart revision schedule based on quiz performance
    const revisionSchedule = await createSmartRevisionSchedule(
      req.user._id,
      topicId,
      scorePercentage
    );

    res.status(201).json({
      message: "Quiz result submitted successfully",
      result: quizResult,
      pointsEarned: points,
      stats: {
        totalQuizzes: updatedUser.totalQuizzes,
        averageScore: updatedUser.averageScore,
        totalPoints: updatedUser.points
      },
      revisionSchedule: {
        baseIntervals: revisionSchedule.baseIntervals,
        adjustedIntervals: revisionSchedule.adjustedIntervals,
        adaptiveMultiplier: revisionSchedule.adaptiveMultiplier
      }
    });
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({
      message: "Failed to submit quiz result",
      error: error.message
    });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const { topicId } = req.params;

    const results = await QuizAttempt.find({
      userId: req.user._id,
      topicId
    }).sort({ createdAt: -1 });

    res.json({
      message: "Quiz results fetched successfully",
      results
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({
      message: "Failed to fetch quiz results",
      error: error.message
    });
  }
};
