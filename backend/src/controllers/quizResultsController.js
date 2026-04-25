import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";

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

    // Update user points based on score
    const points = Math.round((score / totalQuestions) * 100);
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points } }
    );

    res.status(201).json({
      message: "Quiz result submitted successfully",
      result: quizResult,
      pointsEarned: points
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
