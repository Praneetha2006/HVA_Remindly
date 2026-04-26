import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    explanation: {
      type: String,
      required: true
    },

    category: {
      type: String,
      default: "general"
    },

    memoryStrength: {
      type: Number,
      default: 100
    },

    lastRevisedAt: {
      type: Date
    },

    nextRevisionAt: {
      type: Date
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ['upcoming', 'dueToday', 'overdue', 'completed'],
      default: 'upcoming'
    },

    revisionSettings: {
      isCustom: {
        type: Boolean,
        default: false
      },

      intervals: {
        type: [Number],
        default: [1, 7, 30]
      },

      adaptiveMode: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;