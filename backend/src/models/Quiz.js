import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },

    revisionScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RevisionSchedule"
    },

    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    correctStreak: {
      type: Number,
      default: 0
    },

    wrongStreak: {
      type: Number,
      default: 0
    },

    totalAnswered: {
      type: Number,
      default: 0
    },

    correctAnswers: {
      type: Number,
      default: 0
    },

    wrongAnswers: {
      type: Number,
      default: 0
    },

    score: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress"
    },

    questionsShown: {
      type: [String],
      default: []
    },

    totalQuestionsToShow: {
      type: Number,
      default: 5
    },

    prefetchedQuestions: {
      type: {
        easy: [{ question: String, options: [String], correctAnswer: String, explanation: String, difficulty: String }],
        medium: [{ question: String, options: [String], correctAnswer: String, explanation: String, difficulty: String }],
        hard: [{ question: String, options: [String], correctAnswer: String, explanation: String, difficulty: String }],
        other: [{ question: String, options: [String], correctAnswer: String, explanation: String, difficulty: String }]
      },
      default: { easy: [], medium: [], hard: [], other: [] }
    }
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
