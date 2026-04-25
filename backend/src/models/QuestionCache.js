import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  explanation: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  }
});

const cacheSchema = new mongoose.Schema(
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

    easy: [questionSchema],
    medium: [questionSchema],
    hard: [questionSchema],
    other: [questionSchema]
  },
  { timestamps: true }
);

const QuestionCache = mongoose.model("QuestionCache", cacheSchema);

export default QuestionCache;
