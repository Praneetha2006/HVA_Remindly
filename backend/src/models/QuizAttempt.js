import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },
    question: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    difficulty: String
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);